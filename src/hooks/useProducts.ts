import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  sku: string;
  barcode?: string | null;
  name_th: string;
  name_en: string;
  description?: string | null;
  product_type_id?: string | null;
  base_price: number;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  product_types?: {
    code: string;
    name_th: string;
    name_en: string;
  } | null;
}

export interface ProductInput {
  sku: string;
  barcode?: string;
  name_th: string;
  name_en: string;
  description?: string;
  product_type_id?: string;
  base_price: string;
}

export const useProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_types (
            code,
            name_th,
            name_en
          )
        `)
        .eq("is_active", true)
        .order("sku", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: ProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          ...input,
          base_price: parseFloat(input.base_price),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มสินค้าได้",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ProductInput> }) => {
      const updateData: any = { ...input };
      if (input.base_price) {
        updateData.base_price = parseFloat(input.base_price);
      }

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "สำเร็จ",
        description: "อัพเดทสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทสินค้าได้",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "สำเร็จ",
        description: "ลบสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบสินค้าได้",
        variant: "destructive",
      });
    },
  });

  return {
    products: products || [],
    isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
