import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays } from "date-fns";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const yesterdayStart = startOfDay(subDays(today, 1));
      const yesterdayEnd = endOfDay(subDays(today, 1));

      // ยอดขายวันนี้
      const { data: todaySales, error: todaySalesError } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("sale_date", todayStart.toISOString())
        .lte("sale_date", todayEnd.toISOString());

      if (todaySalesError) throw todaySalesError;

      // ยอดขายเมื่อวาน
      const { data: yesterdaySales, error: yesterdaySalesError } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("sale_date", yesterdayStart.toISOString())
        .lte("sale_date", yesterdayEnd.toISOString());

      if (yesterdaySalesError) throw yesterdaySalesError;

      // คำสั่งซื้อวันนี้
      const { count: todayOrdersCount, error: todayOrdersError } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .gte("sale_date", todayStart.toISOString())
        .lte("sale_date", todayEnd.toISOString());

      if (todayOrdersError) throw todayOrdersError;

      // คำสั่งซื้อเมื่อวาน
      const { count: yesterdayOrdersCount, error: yesterdayOrdersError } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .gte("sale_date", yesterdayStart.toISOString())
        .lte("sale_date", yesterdayEnd.toISOString());

      if (yesterdayOrdersError) throw yesterdayOrdersError;

      // สินค้าในคลัง
      const { data: stockData, error: stockError } = await supabase
        .from("branch_products")
        .select("quantity");

      if (stockError) throw stockError;

      // จำนวนสาขา
      const { count: branchCount, error: branchError } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

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
      };
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const activities: Array<{
        type: string;
        description: string;
        amount: string;
        time: Date;
        status: string;
        id: string;
      }> = [];

      // ยอดขายล่าสุด
      const { data: recentSales, error: salesError } = await supabase
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

      // การโอนสินค้าล่าสุด
      const { data: recentTransfers, error: transfersError } = await supabase
        .from("transfers")
        .select(`
          id,
          created_at,
          status,
          to_branch:to_branch_id (name_th),
          transfer_items (quantity)
        `)
        .order("created_at", { ascending: false })
        .limit(2);

      if (transfersError) throw transfersError;

      recentTransfers?.forEach((transfer: any) => {
        const totalQty = transfer.transfer_items?.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0
        ) || 0;

        activities.push({
          type: "transfer",
          description: `โอนสินค้าไป ${transfer.to_branch?.name_th || "สาขา"}`,
          amount: `${totalQty} ชิ้น`,
          time: new Date(transfer.created_at),
          status: transfer.status === "COMPLETED" ? "completed" : "pending",
          id: transfer.id,
        });
      });

      // การซื้อสินค้าล่าสุด
      const { data: recentPurchases, error: purchasesError } = await supabase
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

      // เรียงลำดับตามเวลา
      return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
    },
  });
};
