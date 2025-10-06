import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Receipt, Plus, FileText, Search, TrendingUp } from "lucide-react";
import { SaleDialog } from "@/components/sales/SaleDialog";
import { useSales } from "@/hooks/useSales";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Sales = () => {
  const { sales, isLoading, createSale, cancelSale } = useSales();
  const [dialogOpen, setDialogOpen] = useState(false);
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
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ขายสินค้า / Sales</h2>
            <p className="text-sm text-muted-foreground">บันทึกการขายและออกใบเสร็จ</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            สร้างใบขาย
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ยอดขายทั้งหมด</p>
                  <p className="text-2xl font-bold">
                    ฿{totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">กำไรรวม</p>
                  <p className="text-2xl font-bold text-green-600">
                    ฿{totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">จำนวนการขาย</p>
                  <p className="text-2xl font-bold">
                    {filteredSales?.filter(s => s.status === "COMPLETED").length || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                รายการขาย
              </CardTitle>
              <div className="relative w-64">
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ลูกค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">รายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ยอดรวม</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">กำไร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => {
                      const profit = sale.sale_items?.reduce((sum, item) => {
                        return sum + (item.total_price - item.total_cost);
                      }, 0) || 0;

                      return (
                        <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-4 py-3 font-mono text-sm">{sale.doc_no}</td>
                          <td className="px-4 py-3 text-sm">
                            {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sale.branches?.name_th}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sale.customer_name || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {sale.sale_items?.length || 0} รายการ
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ฿{sale.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600">
                            ฿{profit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(sale.status)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" title="ดูรายละเอียด">
                                <FileText className="h-4 w-4" />
                              </Button>
                              {sale.status === "COMPLETED" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCancellingId(sale.id)}
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
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ไม่พบข้อมูลการขาย</p>
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
