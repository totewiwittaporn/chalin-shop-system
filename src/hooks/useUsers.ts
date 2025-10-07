import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  roles: Array<{
    id: string;
    role: string;
    branch_id: string | null;
    branch?: {
      name_th: string;
      name_en: string;
    };
  }>;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles, error: rolesError } = await supabase
            .from("user_roles")
            .select(`
              id,
              role,
              branch_id,
              branches:branch_id (
                name_th,
                name_en
              )
            `)
            .eq("user_id", profile.id);

          if (rolesError) throw rolesError;

          return {
            ...profile,
            roles: roles.map((role: any) => ({
              id: role.id,
              role: role.role,
              branch_id: role.branch_id,
              branch: role.branches,
            })),
          };
        })
      );

      return usersWithRoles as UserProfile[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      full_name?: string;
      phone?: string;
      role: string;
      branch_id?: string;
    }) => {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Update profile with phone
      if (data.phone) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ phone: data.phone })
          .eq("id", authData.user.id);

        if (updateError) throw updateError;
      }

      // Create user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: data.role as "admin" | "staff" | "consignment_owner",
        branch_id: data.branch_id || null,
      });

      if (roleError) throw roleError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("สร้างผู้ใช้งานสำเร็จ");
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      role_id: string;
      role: "admin" | "staff" | "consignment_owner";
      branch_id?: string;
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({
          role: data.role,
          branch_id: data.branch_id || null,
        })
        .eq("id", data.role_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("อัพเดทบทบาทสำเร็จ");
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });
};

export const useDeleteUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role_id: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", role_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("ลบบทบาทสำเร็จ");
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      // Call edge function to delete user
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user_id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("ลบผู้ใช้งานสำเร็จ");
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });
};
