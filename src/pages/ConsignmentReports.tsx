import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBarChart, Package, DollarSign, TrendingUp, CalendarIcon } from "lucide-react";
import { useConsignmentReports } from "@/hooks/useConsignmentReports";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ConsignmentReports = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const { 
    consignmentStock, 
    isLoadingStock, 
    consignmentSales, 
    isLoadingSales,
    summary 
  } = useConsignmentReports(startDate, endDate);

  // Group stock by branch
  const stockByBranch = consignmentStock?.reduce((acc, item) => {
    if (!acc[item.branch_id]) {
      acc[item.branch_id] = {
        branch_name: item.branch_name,
        branch_code: item.branch_code,
        items: [],
        total_quantity: 0,
        total_value: 0,
      };
    }
    acc[item.branch_id].items.push(item);
    acc[item.branch_id].total_quantity += item.quantity;
    acc[item.branch_id].total_value += item.stock_value;
    return acc;
  }, {} as Record<string, any>);

  // Group sales by branch
  const salesByBranch = consignmentSales?.reduce((acc, sale) => {
    if (!acc[sale.branch_id]) {
      acc[sale.branch_id] = {
        branch_name: sale.branch_name,
        branch_code: sale.branch_code,
        sales: [],
        total_amount: 0,
        total_commission: 0,
        total_profit: 0,
        sale_count: 0,
      };
    }
    acc[sale.branch_id].sales.push(sale);
    acc[sale.branch_id].total_amount += sale.total_amount;
    acc[sale.branch_id].total_commission += sale.commission_amount;
    acc[sale.branch_id].total_profit += sale.profit;
    acc[sale.branch_id].sale_count += 1;
    return acc;
  }, {} as Record<string, any>);

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">รายงานฝากขาย / Consignment Reports</h2>
              <p className="text-sm text-muted-foreground">สรุปยอดขายและสต็อกร้านฝาก</p>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(!startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "เริ่มต้น"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(!endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "สิ้นสุด"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">สต็อกฝากขาย</p>
                    <p className="text-2xl font-bold">{summary.totalStock.toLocaleString()}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">มูลค่าสต็อก</p>
                    <p className="text-2xl font-bold">
                      ฿{summary.totalStockValue.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ยอดขายรวม</p>
                    <p className="text-2xl font-bold">
                      ฿{summary.totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <FileBarChart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ค่าคอมมิชชัน</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ฿{summary.totalCommission.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="stock" className="w-full">
          <TabsList>
            <TabsTrigger value="stock">สต็อกฝากขาย</TabsTrigger>
            <TabsTrigger value="sales">ยอดขาย & คอมมิชชัน</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  สต็อกฝากขายตามสาขา
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStock ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : stockByBranch && Object.keys(stockByBranch).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(stockByBranch).map(([branchId, data]: [string, any]) => (
                      <div key={branchId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{data.branch_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {data.total_quantity} ชิ้น • มูลค่า ฿{data.total_value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <Badge>{data.branch_code}</Badge>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b text-sm">
                                <th className="px-2 py-2 text-left text-muted-foreground">รหัส</th>
                                <th className="px-2 py-2 text-left text-muted-foreground">สินค้า</th>
                                <th className="px-2 py-2 text-center text-muted-foreground">จำนวน</th>
                                <th className="px-2 py-2 text-right text-muted-foreground">ราคาต้นทุน</th>
                                <th className="px-2 py-2 text-right text-muted-foreground">มูลค่า</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b hover:bg-muted/50">
                                  <td className="px-2 py-2 text-sm font-mono">{item.product_sku}</td>
                                  <td className="px-2 py-2 text-sm">{item.product_name}</td>
                                  <td className="px-2 py-2 text-sm text-center">{item.quantity}</td>
                                  <td className="px-2 py-2 text-sm text-right">
                                    ฿{item.base_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-2 py-2 text-sm text-right font-semibold">
                                    ฿{item.stock_value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>ไม่พบข้อมูลสต็อกฝากขาย</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  ยอดขาย & ค่าคอมมิชชัน
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : salesByBranch && Object.keys(salesByBranch).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(salesByBranch).map(([branchId, data]: [string, any]) => (
                      <div key={branchId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{data.branch_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {data.sale_count} รายการ • ยอดขาย ฿{data.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">ค่าคอมมิชชัน</p>
                            <p className="text-xl font-bold text-orange-600">
                              ฿{data.total_commission.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b text-sm">
                                <th className="px-2 py-2 text-left text-muted-foreground">เลขที่</th>
                                <th className="px-2 py-2 text-left text-muted-foreground">วันที่</th>
                                <th className="px-2 py-2 text-left text-muted-foreground">ลูกค้า</th>
                                <th className="px-2 py-2 text-right text-muted-foreground">ยอดขาย</th>
                                <th className="px-2 py-2 text-right text-muted-foreground">ต้นทุน</th>
                                <th className="px-2 py-2 text-right text-muted-foreground">กำไร</th>
                                <th className="px-2 py-2 text-right text-muted-foreground">คอมฯ (15%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.sales.map((sale: any) => (
                                <tr key={sale.id} className="border-b hover:bg-muted/50">
                                  <td className="px-2 py-2 text-sm font-mono">{sale.doc_no}</td>
                                  <td className="px-2 py-2 text-sm">
                                    {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                                  </td>
                                  <td className="px-2 py-2 text-sm">{sale.customer_name || "-"}</td>
                                  <td className="px-2 py-2 text-sm text-right font-semibold">
                                    ฿{sale.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-2 py-2 text-sm text-right">
                                    ฿{sale.total_cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-2 py-2 text-sm text-right text-green-600">
                                    ฿{sale.profit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-2 py-2 text-sm text-right font-semibold text-orange-600">
                                    ฿{sale.commission_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>ไม่พบข้อมูลยอดขาย</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConsignmentReports;
