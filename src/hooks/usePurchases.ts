import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PurchaseItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
  };
}

export interface Purchase {
  id: string;
  doc_no: string;
  branch_id: string;
  purchase_date: string;
  supplier_name: string;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  total_amount: number;
  notes?: string;
  received_at?: string;
  created_at: string;
  branches?: {
    name_th: string;
    name_en: string;
    code: string;
  };
  purchase_items?: PurchaseItem[];
}

export interface PurchaseInput {
  branch_id: string;
  supplier_name: string;
  purchase_date: Date;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_cost: number;
  }[];
}

export function usePurchases() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          branches (name_th, name_en, code),
          purchase_items (
            *,
            products (sku, name_th, name_en)
          )
        `)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      return data as Purchase[];
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (input: PurchaseInput) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate doc_no
      const { data: branch } = await supabase
        .from("branches")
        .select("code")
        .eq("id", input.branch_id)
        .single();

      const dateStr = input.purchase_date.toISOString().slice(0, 7).replace("-", "");
      const { data: lastPurchase } = await supabase
        .from("purchases")
        .select("doc_no")
        .like("doc_no", `PO-${branch?.code}-${dateStr}-%`)
        .order("doc_no", { ascending: false })
        .limit(1)
        .single();

      let runningNo = 1;
      if (lastPurchase) {
        const match = lastPurchase.doc_no.match(/-(\d+)$/);
        if (match) runningNo = parseInt(match[1]) + 1;
      }

      const doc_no = `PO-${branch?.code}-${dateStr}-${String(runningNo).padStart(3, "0")}`;

      // Calculate total
      const total_amount = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

      // Insert purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          doc_no,
          branch_id: input.branch_id,
          purchase_date: input.purchase_date.toISOString().split("T")[0],
          supplier_name: input.supplier_name,
          notes: input.notes,
          total_amount,
          status: "PENDING",
          created_by: user.id,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Insert items
      const items = input.items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "สร้างใบสั่งซื้อสำเร็จ",
        description: "บันทึกข้อมูลใบสั่งซื้อเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const receivePurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      // Get purchase with items
      const { data: purchase, error: fetchError } = await supabase
        .from("purchases")
        .select(`
          *,
          purchase_items (*)
        `)
        .eq("id", purchaseId)
        .single();

      if (fetchError) throw fetchError;

      // Update purchase status
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          status: "RECEIVED",
          received_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);

      if (updateError) throw updateError;

      // Create stock lots for each item
      const stockLots = purchase.purchase_items.map((item: any) => ({
        branch_id: purchase.branch_id,
        product_id: item.product_id,
        quantity: item.quantity,
        remaining_quantity: item.quantity,
        unit_cost: parseFloat(item.unit_cost),
        reference_doc_type: "PURCHASE" as const,
        reference_doc_id: purchaseId,
      }));

      const { error: lotsError } = await supabase
        .from("stock_lots")
        .insert(stockLots);

      if (lotsError) throw lotsError;

      // Update branch_products quantities
      for (const item of purchase.purchase_items) {
        const { data: existing } = await supabase
          .from("branch_products")
          .select("*")
          .eq("branch_id", purchase.branch_id)
          .eq("product_id", item.product_id)
          .single();

        if (existing) {
          await supabase
            .from("branch_products")
            .update({ quantity: existing.quantity + item.quantity })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("branch_products")
            .insert({
              branch_id: purchase.branch_id,
              product_id: item.product_id,
              quantity: item.quantity,
              min_stock: 0,
            });
        }
      }

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-lots"] });
      toast({
        title: "รับสินค้าสำเร็จ",
        description: "อัปเดตสต็อกสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelPurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase
        .from("purchases")
        .update({ status: "CANCELLED" })
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "ยกเลิกใบสั่งซื้อสำเร็จ",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    purchases,
    isLoading,
    createPurchase: createPurchaseMutation.mutateAsync,
    isCreating: createPurchaseMutation.isPending,
    receivePurchase: receivePurchaseMutation.mutateAsync,
    isReceiving: receivePurchaseMutation.isPending,
    cancelPurchase: cancelPurchaseMutation.mutateAsync,
    isCancelling: cancelPurchaseMutation.isPending,
  };
}
