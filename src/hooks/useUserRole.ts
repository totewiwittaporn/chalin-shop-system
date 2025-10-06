import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          role,
          branch_id,
          branches:branch_id (
            id,
            name_th,
            name_en,
            type
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      return data;
    },
    enabled: !!user?.id,
  });
};

export const useIsAdmin = () => {
  const { data: roles } = useUserRole();
  return roles?.some((role: any) => role.role === "admin") ?? false;
};

export const useIsStaff = () => {
  const { data: roles } = useUserRole();
  return roles?.some((role: any) => role.role === "staff") ?? false;
};

export const useIsConsignmentOwner = () => {
  const { data: roles } = useUserRole();
  return roles?.some((role: any) => role.role === "consignment_owner") ?? false;
};
