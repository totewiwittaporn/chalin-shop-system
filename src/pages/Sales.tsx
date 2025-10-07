import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Receipt, Plus, FileText, Search, TrendingUp } from "lucide-react";
import { SaleDialog } from "@/components/sales/SaleDialog";
import { ViewSaleDialog } from "@/components/sales/ViewSaleDialog";
import { useSales } from "@/hooks/useSales";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Sales = () => {
  const { sales, isLoading, createSale, cancelSale } = useSales();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredSales = sales?.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.doc_no.toLowerCase().includes(searchLower) ||
      sale.customer_name?.toLowerCase().includes(searchLower) ||
      sale.branches?.name_th.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">สำเร็จ</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancel = async (id: string) => {
    await cancelSale(id);
    setCancellingId(null);
  };

  // Calculate summary stats
  const totalSales = filteredSales?.filter(s => s.status === "COMPLETED").reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
  const totalProfit = filteredSales?.filter(s => s.status === "COMPLETED").reduce((sum, sale) => {
    const itemsProfit = sale.sale_items?.reduce((itemSum, item) => {
      return itemSum + (item.total_price - item.total_cost);
    }, 0) || 0;
    return sum + itemsProfit;
  }, 0) || 0;

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-4 md:py-8">
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">ขายสินค้า - ร้านฝากขาย</h2>
            <p className="text-xs md:text-sm text-muted-foreground">บันทึกการขายและออกใบเสร็จสำหรับร้านฝากขาย</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            สร้างใบขาย
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">ยอดขายทั้งหมด</p>
                  <p className="text-lg md:text-2xl font-bold">
                    ฿{totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Receipt className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">กำไรรวม</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    ฿{totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">จำนวนการขาย</p>
                  <p className="text-lg md:text-2xl font-bold">
                    {filteredSales?.filter(s => s.status === "COMPLETED").length || 0}
                  </p>
                </div>
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Receipt className="h-4 w-4 md:h-5 md:w-5" />
                รายการขาย
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาเลขที่เอกสาร, ลูกค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredSales && filteredSales.length > 0 ? (
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground">เลขที่</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground hidden sm:table-cell">วันที่</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground hidden md:table-cell">สาขา</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground hidden lg:table-cell">ลูกค้า</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground">ยอดรวม</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground hidden md:table-cell">กำไร</th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground">สถานะ</th>
                        <th className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-medium text-muted-foreground">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => {
                        const profit = sale.sale_items?.reduce((sum, item) => {
                          return sum + (item.total_price - item.total_cost);
                        }, 0) || 0;

                        return (
                          <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                            <td className="px-3 md:px-4 py-3 font-mono text-xs md:text-sm">{sale.doc_no}</td>
                            <td className="px-3 md:px-4 py-3 text-xs md:text-sm hidden sm:table-cell">
                              {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                            </td>
                            <td className="px-3 md:px-4 py-3 text-xs md:text-sm hidden md:table-cell">
                              {sale.branches?.name_th}
                            </td>
                            <td className="px-3 md:px-4 py-3 text-xs md:text-sm hidden lg:table-cell">
                              {sale.customer_name || "-"}
                            </td>
                            <td className="px-3 md:px-4 py-3 font-semibold text-xs md:text-sm">
                              ฿{sale.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 md:px-4 py-3 font-semibold text-green-600 text-xs md:text-sm hidden md:table-cell">
                              ฿{profit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 md:px-4 py-3">{getStatusBadge(sale.status)}</td>
                            <td className="px-3 md:px-4 py-3">
                              <div className="flex justify-end gap-1 md:gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setViewingSale(sale)}
                                  title="ดูรายละเอียด" 
                                  className="h-8 w-8 p-0"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {sale.status === "COMPLETED" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCancellingId(sale.id)}
                                    className="text-xs"
                                  >
                                    ยกเลิก
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">ไม่พบข้อมูลการขาย</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={createSale}
      />

      <ViewSaleDialog
        open={!!viewingSale}
        onOpenChange={(open) => !open && setViewingSale(null)}
        sale={viewingSale}
      />

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิก</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการยกเลิกการขายนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้ และจะไม่คืนสต็อกสินค้า
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => cancellingId && handleCancel(cancellingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ยืนยันยกเลิก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Sales;
