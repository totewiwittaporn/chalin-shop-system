import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ShoppingCart, Plus, FileText, Search, Package } from "lucide-react";
import { PurchaseDialog } from "@/components/purchases/PurchaseDialog";
import { usePurchases } from "@/hooks/usePurchases";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Purchases = () => {
  const { purchases, isLoading, createPurchase, receivePurchase, cancelPurchase } = usePurchases();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredPurchases = purchases?.filter((purchase) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      purchase.doc_no.toLowerCase().includes(searchLower) ||
      purchase.supplier_name.toLowerCase().includes(searchLower) ||
      purchase.branches?.name_th.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <Badge variant="default">รับสินค้าแล้ว</Badge>;
      case "PENDING":
        return <Badge variant="secondary">รอรับสินค้า</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReceive = async (id: string) => {
    await receivePurchase(id);
    setReceivingId(null);
  };

  const handleCancel = async (id: string) => {
    await cancelPurchase(id);
    setCancellingId(null);
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ซื้อสินค้า / Purchases</h2>
            <p className="text-sm text-muted-foreground">บันทึกการสั่งซื้อและรับสินค้า</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            สร้างใบสั่งซื้อ
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                รายการสั่งซื้อ
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาเลขที่เอกสาร, ผู้จำหน่าย..."
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
            ) : filteredPurchases && filteredPurchases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ผู้จำหน่าย</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">รายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ยอดรวม</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{purchase.doc_no}</td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(purchase.purchase_date), "dd/MM/yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {purchase.branches?.name_th}
                        </td>
                        <td className="px-4 py-3">{purchase.supplier_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {purchase.purchase_items?.length || 0} รายการ
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          ฿{purchase.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(purchase.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" title="ดูรายละเอียด">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {purchase.status === "PENDING" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReceivingId(purchase.id)}
                                >
                                  <Package className="h-4 w-4 mr-1" />
                                  รับสินค้า
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCancellingId(purchase.id)}
                                >
                                  ยกเลิก
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ไม่พบข้อมูลใบสั่งซื้อ</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PurchaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={createPurchase}
      />

      <AlertDialog open={!!receivingId} onOpenChange={() => setReceivingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการรับสินค้า</AlertDialogTitle>
            <AlertDialogDescription>
              การรับสินค้าจะอัปเดตสต็อกสินค้าในระบบและสร้าง Stock Lot ใหม่ ต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => receivingId && handleReceive(receivingId)}>
              ยืนยันรับสินค้า
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิก</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการยกเลิกใบสั่งซื้อนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
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

export default Purchases;
