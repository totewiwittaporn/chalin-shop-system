import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductType {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductTypeInput {
  code: string;
  name_th: string;
  name_en: string;
  description?: string;
}

export const useProductTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productTypes, isLoading } = useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_types")
        .select("*")
        .order("code", { ascending: true });

      if (error) throw error;
      return data as ProductType[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: ProductTypeInput) => {
      const { data, error } = await supabase
        .from("product_types")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มประเภทสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มประเภทสินค้าได้",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ProductTypeInput> }) => {
      const { data, error } = await supabase
        .from("product_types")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast({
        title: "สำเร็จ",
        description: "อัพเดทประเภทสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทประเภทสินค้าได้",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_types").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast({
        title: "สำเร็จ",
        description: "ลบประเภทสินค้าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบประเภทสินค้าได้",
        variant: "destructive",
      });
    },
  });

  return {
    productTypes: productTypes || [],
    isLoading,
    createProductType: createMutation.mutateAsync,
    updateProductType: updateMutation.mutateAsync,
    deleteProductType: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
