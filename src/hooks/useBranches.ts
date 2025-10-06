import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Branch {
  id: string;
  code: string;
  type: "MAIN" | "BRANCH" | "CONSIGNMENT";
  name_th: string;
  name_en: string;
  address_th?: string | null;
  address_en?: string | null;
  phone?: string | null;
  company_name_th?: string | null;
  company_name_en?: string | null;
  tax_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchInput {
  code: string;
  type: "MAIN" | "BRANCH" | "CONSIGNMENT";
  name_th: string;
  name_en: string;
  address_th?: string;
  address_en?: string;
  phone?: string;
  company_name_th?: string;
  company_name_en?: string;
  tax_id?: string;
}

export const useBranches = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) throw error;
      return data as Branch[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: BranchInput) => {
      const { data, error } = await supabase
        .from("branches")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มสาขาเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มสาขาได้",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<BranchInput> }) => {
      const { data, error } = await supabase
        .from("branches")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "สำเร็จ",
        description: "อัพเดทสาขาเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทสาขาได้",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("branches")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "สำเร็จ",
        description: "ลบสาขาเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบสาขาได้",
        variant: "destructive",
      });
    },
  });

  return {
    branches: branches || [],
    isLoading,
    createBranch: createMutation.mutateAsync,
    updateBranch: updateMutation.mutateAsync,
    deleteBranch: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
