import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuotationItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
  };
}

export interface Quotation {
  id: string;
  doc_no: string;
  branch_id: string;
  quotation_date: string;
  valid_until: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  notes?: string;
  sent_at?: string;
  accepted_at?: string;
  created_at: string;
  branches?: {
    name_th: string;
    name_en: string;
    code: string;
  };
  quotation_items?: QuotationItem[];
}

export interface QuotationInput {
  branch_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  quotation_date: Date;
  valid_until: Date;
  discount?: number;
  tax?: number;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export function useQuotations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotations, isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          branches (name_th, name_en, code),
          quotation_items (
            *,
            products (sku, name_th, name_en)
          )
        `)
        .order("quotation_date", { ascending: false });

      if (error) throw error;
      return data as Quotation[];
    },
  });

  const createQuotationMutation = useMutation({
    mutationFn: async (input: QuotationInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate doc_no
      const { data: branch } = await supabase
        .from("branches")
        .select("code")
        .eq("id", input.branch_id)
        .single();

      const dateStr = input.quotation_date.toISOString().slice(0, 7).replace("-", "");
      const { data: lastQuotation } = await supabase
        .from("quotations")
        .select("doc_no")
        .like("doc_no", `QT-${branch?.code}-${dateStr}-%`)
        .order("doc_no", { ascending: false })
        .limit(1)
        .single();

      let runningNo = 1;
      if (lastQuotation) {
        const match = lastQuotation.doc_no.match(/-(\d+)$/);
        if (match) runningNo = parseInt(match[1]) + 1;
      }

      const doc_no = `QT-${branch?.code}-${dateStr}-${String(runningNo).padStart(3, "0")}`;

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discount = input.discount || 0;
      const tax = input.tax || 0;
      const total_amount = subtotal - discount + tax;

      // Insert quotation
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          doc_no,
          branch_id: input.branch_id,
          quotation_date: input.quotation_date.toISOString().split("T")[0],
          valid_until: input.valid_until.toISOString().split("T")[0],
          customer_name: input.customer_name,
          customer_email: input.customer_email,
          customer_phone: input.customer_phone,
          subtotal,
          discount,
          tax,
          total_amount,
          notes: input.notes,
          status: "DRAFT",
          created_by: user.id,
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Insert items
      const items = input.items.map(item => ({
        quotation_id: quotation.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast({
        title: "สร้างใบเสนอราคาสำเร็จ",
        description: "บันทึกข้อมูลใบเสนอราคาเรียบร้อยแล้ว",
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

  const updateQuotationMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: QuotationInput }) => {
      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discount = input.discount || 0;
      const tax = input.tax || 0;
      const total_amount = subtotal - discount + tax;

      // Update quotation
      const { error: quotationError } = await supabase
        .from("quotations")
        .update({
          quotation_date: input.quotation_date.toISOString().split("T")[0],
          valid_until: input.valid_until.toISOString().split("T")[0],
          customer_name: input.customer_name,
          customer_email: input.customer_email,
          customer_phone: input.customer_phone,
          subtotal,
          discount,
          tax,
          total_amount,
          notes: input.notes,
        })
        .eq("id", id);

      if (quotationError) throw quotationError;

      // Delete old items and insert new ones
      await supabase
        .from("quotation_items")
        .delete()
        .eq("quotation_id", id);

      const items = input.items.map(item => ({
        quotation_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(items);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast({
        title: "แก้ไขใบเสนอราคาสำเร็จ",
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

  const sendQuotationMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      const { error } = await supabase
        .from("quotations")
        .update({
          status: "SENT",
          sent_at: new Date().toISOString(),
        })
        .eq("id", quotationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast({
        title: "ส่งใบเสนอราคาสำเร็จ",
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

  const acceptQuotationMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      const { error } = await supabase
        .from("quotations")
        .update({
          status: "ACCEPTED",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", quotationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast({
        title: "ยอมรับใบเสนอราคาสำเร็จ",
        description: "สามารถแปลงเป็นใบขายได้แล้ว",
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

  const rejectQuotationMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      const { error } = await supabase
        .from("quotations")
        .update({ status: "REJECTED" })
        .eq("id", quotationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast({
        title: "ปฏิเสธใบเสนอราคาสำเร็จ",
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
    quotations,
    isLoading,
    createQuotation: createQuotationMutation.mutateAsync,
    isCreating: createQuotationMutation.isPending,
    updateQuotation: updateQuotationMutation.mutateAsync,
    isUpdating: updateQuotationMutation.isPending,
    sendQuotation: sendQuotationMutation.mutateAsync,
    isSending: sendQuotationMutation.isPending,
    acceptQuotation: acceptQuotationMutation.mutateAsync,
    isAccepting: acceptQuotationMutation.isPending,
    rejectQuotation: rejectQuotationMutation.mutateAsync,
    isRejecting: rejectQuotationMutation.isPending,
  };
}
