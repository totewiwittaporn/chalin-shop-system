import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number;
  total_cost: number;
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
  };
}

export interface Sale {
  id: string;
  doc_no: string;
  branch_id: string;
  sale_date: string;
  customer_name?: string;
  status: "COMPLETED" | "CANCELLED";
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  branches?: {
    name_th: string;
    name_en: string;
    code: string;
  };
  sale_items?: SaleItem[];
}

export interface SaleInput {
  branch_id: string;
  customer_name?: string;
  sale_date: Date;
  discount?: number;
  tax?: number;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export function useSales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          branches (name_th, name_en, code),
          sale_items (
            *,
            products (sku, name_th, name_en)
          )
        `)
        .order("sale_date", { ascending: false });

      if (error) throw error;
      return data as Sale[];
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (input: SaleInput) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate doc_no
      const { data: branch } = await supabase
        .from("branches")
        .select("code")
        .eq("id", input.branch_id)
        .single();

      const dateStr = input.sale_date.toISOString().slice(0, 7).replace("-", "");
      const { data: lastSale } = await supabase
        .from("sales")
        .select("doc_no")
        .like("doc_no", `INV-${branch?.code}-${dateStr}-%`)
        .order("doc_no", { ascending: false })
        .limit(1)
        .single();

      let runningNo = 1;
      if (lastSale) {
        const match = lastSale.doc_no.match(/-(\d+)$/);
        if (match) runningNo = parseInt(match[1]) + 1;
      }

      const doc_no = `INV-${branch?.code}-${dateStr}-${String(runningNo).padStart(3, "0")}`;

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discount = input.discount || 0;
      const tax = input.tax || 0;
      const total_amount = subtotal - discount + tax;

      // Prepare sale items with FIFO cost calculation
      const saleItemsData = [];
      
      for (const item of input.items) {
        // Get stock lots for this product in FIFO order
        const { data: stockLots, error: lotsError } = await supabase
          .from("stock_lots")
          .select("*")
          .eq("branch_id", input.branch_id)
          .eq("product_id", item.product_id)
          .gt("remaining_quantity", 0)
          .order("lot_date", { ascending: true });

        if (lotsError) throw lotsError;

        if (!stockLots || stockLots.length === 0) {
          throw new Error(`ไม่มีสต็อกสินค้าเพียงพอสำหรับสินค้า ${item.product_id}`);
        }

        // Calculate total available
        const totalAvailable = stockLots.reduce((sum, lot) => sum + lot.remaining_quantity, 0);
        if (totalAvailable < item.quantity) {
          throw new Error(`สต็อกไม่เพียงพอ มีเพียง ${totalAvailable} ชิ้น`);
        }

        // Calculate weighted average cost using FIFO
        let remainingQty = item.quantity;
        let totalCost = 0;
        const lotsToUpdate = [];

        for (const lot of stockLots) {
          if (remainingQty <= 0) break;

          const qtyFromThisLot = Math.min(remainingQty, lot.remaining_quantity);
          totalCost += qtyFromThisLot * parseFloat(lot.unit_cost.toString());
          
          lotsToUpdate.push({
            id: lot.id,
            newQuantity: lot.remaining_quantity - qtyFromThisLot,
          });

          remainingQty -= qtyFromThisLot;
        }

        const avgUnitCost = totalCost / item.quantity;

        saleItemsData.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          unit_cost: avgUnitCost,
          total_cost: totalCost,
          lotsToUpdate,
        });
      }

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          doc_no,
          branch_id: input.branch_id,
          sale_date: input.sale_date.toISOString().split("T")[0],
          customer_name: input.customer_name,
          subtotal,
          discount,
          tax,
          total_amount,
          notes: input.notes,
          status: "COMPLETED",
          created_by: user.id,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items and update stock lots
      for (const itemData of saleItemsData) {
        // Insert sale item
        const { error: itemError } = await supabase
          .from("sale_items")
          .insert({
            sale_id: sale.id,
            product_id: itemData.product_id,
            quantity: itemData.quantity,
            unit_price: itemData.unit_price,
            total_price: itemData.total_price,
            unit_cost: itemData.unit_cost,
            total_cost: itemData.total_cost,
          });

        if (itemError) throw itemError;

        // Update stock lots
        for (const lotUpdate of itemData.lotsToUpdate) {
          const { error: updateError } = await supabase
            .from("stock_lots")
            .update({ remaining_quantity: lotUpdate.newQuantity })
            .eq("id", lotUpdate.id);

          if (updateError) throw updateError;
        }

        // Update branch_products quantity
        const { data: branchProduct } = await supabase
          .from("branch_products")
          .select("*")
          .eq("branch_id", input.branch_id)
          .eq("product_id", itemData.product_id)
          .single();

        if (branchProduct) {
          await supabase
            .from("branch_products")
            .update({ quantity: branchProduct.quantity - itemData.quantity })
            .eq("id", branchProduct.id);
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-lots"] });
      toast({
        title: "บันทึกการขายสำเร็จ",
        description: "ระบบได้หักสต็อกและคำนวณต้นทุนเรียบร้อยแล้ว",
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

  const cancelSaleMutation = useMutation({
    mutationFn: async (saleId: string) => {
      const { error } = await supabase
        .from("sales")
        .update({ status: "CANCELLED" })
        .eq("id", saleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "ยกเลิกการขายสำเร็จ",
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
    sales,
    isLoading,
    createSale: createSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending,
    cancelSale: cancelSaleMutation.mutateAsync,
    isCancelling: cancelSaleMutation.isPending,
  };
}
