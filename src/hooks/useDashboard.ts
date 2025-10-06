import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { data: roles } = useUserRole();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user?.id || !roles) return null;

      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const yesterdayStart = startOfDay(subDays(today, 1));
      const yesterdayEnd = endOfDay(subDays(today, 1));

      const isAdmin = roles.some((r: any) => r.role === "admin");
      const isStaff = roles.some((r: any) => r.role === "staff");
      const isConsignmentOwner = roles.some((r: any) => r.role === "consignment_owner");
      
      // Get branch IDs that user has access to (Staff and Consignment Owner)
      const userBranchIds = roles
        .filter((r: any) => r.branch_id)
        .map((r: any) => r.branch_id);

      // Determine if user should see all branches (Admin or Staff without specific branches)
      const hasStaffRoleWithoutBranch = roles.some(
        (r: any) => r.role === "staff" && !r.branch_id
      );
      const canSeeAllBranches = isAdmin || hasStaffRoleWithoutBranch;

      // Build query based on role and branch access
      let todaySalesQuery = supabase
        .from("sales")
        .select("total_amount")
        .gte("sale_date", todayStart.toISOString())
        .lte("sale_date", todayEnd.toISOString());

      let yesterdaySalesQuery = supabase
        .from("sales")
        .select("total_amount")
        .gte("sale_date", yesterdayStart.toISOString())
        .lte("sale_date", yesterdayEnd.toISOString());

      let todayOrdersQuery = supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .gte("sale_date", todayStart.toISOString())
        .lte("sale_date", todayEnd.toISOString());

      let yesterdayOrdersQuery = supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .gte("sale_date", yesterdayStart.toISOString())
        .lte("sale_date", yesterdayEnd.toISOString());

      let stockQuery = supabase.from("branch_products").select("quantity");
      let branchQuery = supabase.from("branches").select("*", { count: "exact", head: true }).eq("is_active", true);

      // Filter by branch for non-admin users with specific branches
      if (!canSeeAllBranches && userBranchIds.length > 0) {
        todaySalesQuery = todaySalesQuery.in("branch_id", userBranchIds);
        yesterdaySalesQuery = yesterdaySalesQuery.in("branch_id", userBranchIds);
        todayOrdersQuery = todayOrdersQuery.in("branch_id", userBranchIds);
        yesterdayOrdersQuery = yesterdayOrdersQuery.in("branch_id", userBranchIds);
        stockQuery = stockQuery.in("branch_id", userBranchIds);
        branchQuery = branchQuery.in("id", userBranchIds);
      }

      // Execute queries
      const [
        { data: todaySales, error: todaySalesError },
        { data: yesterdaySales, error: yesterdaySalesError },
        { count: todayOrdersCount, error: todayOrdersError },
        { count: yesterdayOrdersCount, error: yesterdayOrdersError },
        { data: stockData, error: stockError },
        { count: branchCount, error: branchError },
      ] = await Promise.all([
        todaySalesQuery,
        yesterdaySalesQuery,
        todayOrdersQuery,
        yesterdayOrdersQuery,
        stockQuery,
        branchQuery,
      ]);

      if (todaySalesError) throw todaySalesError;
      if (yesterdaySalesError) throw yesterdaySalesError;
      if (todayOrdersError) throw todayOrdersError;
      if (yesterdayOrdersError) throw yesterdayOrdersError;
      if (stockError) throw stockError;
      if (branchError) throw branchError;

      // คำนวณยอดรวม
      const todaySalesTotal = todaySales?.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      ) || 0;

      const yesterdaySalesTotal = yesterdaySales?.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      ) || 0;

      const totalStock = stockData?.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      ) || 0;

      // คำนวณการเปลี่ยนแปลง
      const salesChange = yesterdaySalesTotal > 0
        ? ((todaySalesTotal - yesterdaySalesTotal) / yesterdaySalesTotal) * 100
        : 0;

      const ordersChange = (todayOrdersCount || 0) - (yesterdayOrdersCount || 0);

      return {
        todaySales: todaySalesTotal,
        salesChange,
        ordersCount: todayOrdersCount || 0,
        ordersChange,
        totalStock,
        branchCount: branchCount || 0,
        userRole: isAdmin ? "admin" : isStaff ? "staff" : "consignment_owner",
        canSeeAllBranches,
        userBranchCount: userBranchIds.length,
      };
    },
    enabled: !!user?.id && !!roles,
  });
};

export const useRecentActivity = () => {
  const { user } = useAuth();
  const { data: roles } = useUserRole();

  return useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async () => {
      if (!user?.id || !roles) return [];

      const activities: Array<{
        type: string;
        description: string;
        amount: string;
        time: Date;
        status: string;
        id: string;
      }> = [];

      const isAdmin = roles.some((r: any) => r.role === "admin");
      const isStaff = roles.some((r: any) => r.role === "staff");
      const isConsignmentOwner = roles.some((r: any) => r.role === "consignment_owner");

      // Get branch IDs that user has access to
      const userBranchIds = roles
        .filter((r: any) => r.branch_id)
        .map((r: any) => r.branch_id);

      // Check if user can see all branches
      const hasStaffRoleWithoutBranch = roles.some(
        (r: any) => r.role === "staff" && !r.branch_id
      );
      const canSeeAllBranches = isAdmin || hasStaffRoleWithoutBranch;

      // ยอดขายล่าสุด
      let salesQuery = supabase
        .from("sales")
        .select(`
          id,
          total_amount,
          created_at,
          status,
          branches:branch_id (name_th)
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!canSeeAllBranches && userBranchIds.length > 0) {
        salesQuery = salesQuery.in("branch_id", userBranchIds);
      }

      const { data: recentSales, error: salesError } = await salesQuery;
      if (salesError) throw salesError;

      recentSales?.forEach((sale: any) => {
        activities.push({
          type: "sale",
          description: `ขายสินค้าที่ ${sale.branches?.name_th || "สาขา"}`,
          amount: `฿${Number(sale.total_amount).toLocaleString()}`,
          time: new Date(sale.created_at),
          status: sale.status === "COMPLETED" ? "completed" : "pending",
          id: sale.id,
        });
      });

      // การโอนสินค้าล่าสุด (Admin และ Staff เท่านั้น)
      if (isAdmin || isStaff) {
        let transfersQuery = supabase
          .from("transfers")
          .select(`
            id,
            created_at,
            status,
            to_branch:to_branch_id (name_th),
            from_branch:from_branch_id (name_th),
            transfer_items (quantity)
          `)
          .order("created_at", { ascending: false })
          .limit(2);

        // Staff with specific branches: filter by from_branch_id OR to_branch_id
        if (!canSeeAllBranches && userBranchIds.length > 0) {
          transfersQuery = transfersQuery.or(
            `from_branch_id.in.(${userBranchIds.join(",")}),to_branch_id.in.(${userBranchIds.join(",")})`
          );
        }

        const { data: recentTransfers, error: transfersError } = await transfersQuery;
        if (transfersError) throw transfersError;

        recentTransfers?.forEach((transfer: any) => {
          const totalQty = transfer.transfer_items?.reduce(
            (sum: number, item: any) => sum + (item.quantity || 0),
            0
          ) || 0;

          activities.push({
            type: "transfer",
            description: `โอนสินค้า ${transfer.from_branch?.name_th || "?"} → ${transfer.to_branch?.name_th || "?"}`,
            amount: `${totalQty} ชิ้น`,
            time: new Date(transfer.created_at),
            status: transfer.status === "COMPLETED" ? "completed" : "pending",
            id: transfer.id,
          });
        });
      }

      // การซื้อสินค้าล่าสุด (Admin และ Staff เท่านั้น)
      if (isAdmin || isStaff) {
        let purchasesQuery = supabase
          .from("purchases")
          .select(`
            id,
            total_amount,
            created_at,
            status,
            branches:branch_id (name_th)
          `)
          .order("created_at", { ascending: false })
          .limit(2);

        if (!canSeeAllBranches && userBranchIds.length > 0) {
          purchasesQuery = purchasesQuery.in("branch_id", userBranchIds);
        }

        const { data: recentPurchases, error: purchasesError } = await purchasesQuery;
        if (purchasesError) throw purchasesError;

        recentPurchases?.forEach((purchase: any) => {
          activities.push({
            type: "purchase",
            description: `รับสินค้าเข้า ${purchase.branches?.name_th || "คลัง"}`,
            amount: `฿${Number(purchase.total_amount).toLocaleString()}`,
            time: new Date(purchase.created_at),
            status: purchase.status === "COMPLETED" ? "completed" : "pending",
            id: purchase.id,
          });
        });
      }

      // เรียงลำดับตามเวลา
      return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
    },
    enabled: !!user?.id && !!roles,
  });
};
