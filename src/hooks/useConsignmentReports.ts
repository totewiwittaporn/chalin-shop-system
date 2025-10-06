import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConsignmentStock {
  branch_id: string;
  branch_name: string;
  branch_code: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  base_price: number;
  stock_value: number;
}

export interface ConsignmentSale {
  id: string;
  doc_no: string;
  sale_date: string;
  branch_id: string;
  branch_name: string;
  branch_code: string;
  customer_name?: string;
  total_amount: number;
  total_cost: number;
  profit: number;
  commission_rate: number;
  commission_amount: number;
  sale_items: {
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    unit_cost: number;
    total_cost: number;
  }[];
}

export function useConsignmentReports(startDate?: Date, endDate?: Date) {
  // Consignment Stock Report
  const { data: consignmentStock, isLoading: isLoadingStock } = useQuery({
    queryKey: ["consignment-stock"],
    queryFn: async () => {
      // Get all consignment branches
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, code, name_th, type")
        .eq("type", "CONSIGNMENT")
        .eq("is_active", true);

      if (branchError) throw branchError;

      const stockData: ConsignmentStock[] = [];

      // Get inventory for each consignment branch
      for (const branch of branches || []) {
        const { data: inventory, error: invError } = await supabase
          .from("branch_products")
          .select(`
            quantity,
            product_id,
            products (
              sku,
              name_th,
              base_price
            )
          `)
          .eq("branch_id", branch.id)
          .gt("quantity", 0);

        if (invError) throw invError;

        inventory?.forEach((item: any) => {
          stockData.push({
            branch_id: branch.id,
            branch_name: branch.name_th,
            branch_code: branch.code,
            product_id: item.product_id,
            product_name: item.products.name_th,
            product_sku: item.products.sku,
            quantity: item.quantity,
            base_price: parseFloat(item.products.base_price),
            stock_value: item.quantity * parseFloat(item.products.base_price),
          });
        });
      }

      return stockData;
    },
  });

  // Consignment Sales Report
  const { data: consignmentSales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["consignment-sales", startDate, endDate],
    queryFn: async () => {
      // Get all consignment branches
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, code, name_th, type")
        .eq("type", "CONSIGNMENT")
        .eq("is_active", true);

      if (branchError) throw branchError;

      const branchIds = branches?.map(b => b.id) || [];

      let query = supabase
        .from("sales")
        .select(`
          id,
          doc_no,
          sale_date,
          branch_id,
          customer_name,
          total_amount,
          branches (code, name_th),
          sale_items (
            quantity,
            unit_price,
            total_price,
            unit_cost,
            total_cost,
            products (sku, name_th)
          )
        `)
        .in("branch_id", branchIds)
        .eq("status", "COMPLETED")
        .order("sale_date", { ascending: false });

      if (startDate) {
        query = query.gte("sale_date", startDate.toISOString().split("T")[0]);
      }
      if (endDate) {
        query = query.lte("sale_date", endDate.toISOString().split("T")[0]);
      }

      const { data: sales, error: salesError } = await query;

      if (salesError) throw salesError;

      const salesData: ConsignmentSale[] = sales?.map((sale: any) => {
        const totalCost = sale.sale_items?.reduce((sum: number, item: any) => sum + item.total_cost, 0) || 0;
        const profit = sale.total_amount - totalCost;
        
        // Default commission rate: 15% (can be customized per branch)
        const commissionRate = 0.15;
        const commissionAmount = profit * commissionRate;

        return {
          id: sale.id,
          doc_no: sale.doc_no,
          sale_date: sale.sale_date,
          branch_id: sale.branch_id,
          branch_name: sale.branches.name_th,
          branch_code: sale.branches.code,
          customer_name: sale.customer_name,
          total_amount: sale.total_amount,
          total_cost: totalCost,
          profit: profit,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          sale_items: sale.sale_items?.map((item: any) => ({
            product_name: item.products.name_th,
            product_sku: item.products.sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
          })) || [],
        };
      }) || [];

      return salesData;
    },
  });

  // Summary Stats
  const totalStock = consignmentStock?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalStockValue = consignmentStock?.reduce((sum, item) => sum + item.stock_value, 0) || 0;
  const totalSales = consignmentSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
  const totalCommission = consignmentSales?.reduce((sum, sale) => sum + sale.commission_amount, 0) || 0;
  const totalProfit = consignmentSales?.reduce((sum, sale) => sum + sale.profit, 0) || 0;

  return {
    consignmentStock,
    isLoadingStock,
    consignmentSales,
    isLoadingSales,
    summary: {
      totalStock,
      totalStockValue,
      totalSales,
      totalCommission,
      totalProfit,
    },
  };
}
