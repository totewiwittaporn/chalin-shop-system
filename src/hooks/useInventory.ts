import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BranchProduct {
  id: string;
  branch_id: string;
  product_id: string;
  quantity: number;
  min_stock: number;
  branches?: {
    code: string;
    name_th: string;
    type: string;
  };
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
    base_price: number;
    product_types?: {
      code: string;
      name_th: string;
    } | null;
  };
}

export interface StockAdjustment {
  branch_id: string;
  product_id: string;
  quantity: number;
  adjustment_type: "add" | "subtract" | "set";
}

export const useInventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_products")
        .select(`
          *,
          branches!inner (
            code,
            name_th,
            type
          ),
          products!inner (
            sku,
            name_th,
            name_en,
            base_price,
            product_types (
              code,
              name_th
            )
          )
        `)
        .order("branch_id", { ascending: true })
        .order("product_id", { ascending: true });

      if (error) throw error;
      return data as BranchProduct[];
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: async ({ branch_id, product_id, quantity, adjustment_type }: StockAdjustment) => {
      // Get current stock
      const { data: current, error: fetchError } = await supabase
        .from("branch_products")
        .select("quantity")
        .eq("branch_id", branch_id)
        .eq("product_id", product_id)
        .single();

      if (fetchError) {
        // If not exists, create new
        if (fetchError.code === "PGRST116") {
          const newQuantity = adjustment_type === "set" ? quantity : quantity;
          const { error: insertError } = await supabase
            .from("branch_products")
            .insert({
              branch_id,
              product_id,
              quantity: newQuantity,
              min_stock: 0,
            });

          if (insertError) throw insertError;
          return;
        }
        throw fetchError;
      }

      // Calculate new quantity
      let newQuantity = current.quantity;
      if (adjustment_type === "add") {
        newQuantity = current.quantity + quantity;
      } else if (adjustment_type === "subtract") {
        newQuantity = current.quantity - quantity;
      } else if (adjustment_type === "set") {
        newQuantity = quantity;
      }

      if (newQuantity < 0) {
        throw new Error("จำนวนสต็อกไม่สามารถติดลบได้");
      }

      // Update stock
      const { error: updateError } = await supabase
        .from("branch_products")
        .update({ quantity: newQuantity })
        .eq("branch_id", branch_id)
        .eq("product_id", product_id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "สำเร็จ",
        description: "ปรับสต็อกเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถปรับสต็อกได้",
        variant: "destructive",
      });
    },
  });

  const updateMinStockMutation = useMutation({
    mutationFn: async ({ id, min_stock }: { id: string; min_stock: number }) => {
      const { error } = await supabase
        .from("branch_products")
        .update({ min_stock })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "สำเร็จ",
        description: "อัพเดทสต็อกขั้นต่ำเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทได้",
        variant: "destructive",
      });
    },
  });

  return {
    inventory: inventory || [],
    isLoading,
    adjustStock: adjustStockMutation.mutateAsync,
    updateMinStock: updateMinStockMutation.mutateAsync,
    isAdjusting: adjustStockMutation.isPending,
    isUpdating: updateMinStockMutation.isPending,
  };
};
