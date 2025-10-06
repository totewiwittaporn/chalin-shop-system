import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, FileText } from "lucide-react";

const Purchases = () => {
  const purchases = [
    { id: 1, docNo: "PO-MAIN-202501-001", date: "2025-01-05", supplier: "ABC Jewelry Co.", amount: "฿45,000", status: "RECEIVED" },
    { id: 2, docNo: "PO-MAIN-202501-002", date: "2025-01-06", supplier: "XYZ Accessories", amount: "฿28,500", status: "PENDING" },
    { id: 3, docNo: "PO-MAIN-202412-045", date: "2024-12-28", supplier: "Fashion Imports Ltd.", amount: "฿67,800", status: "RECEIVED" },
  ];

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

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ซื้อสินค้า / Purchases</h2>
            <p className="text-sm text-muted-foreground">บันทึกการสั่งซื้อและรับสินค้า</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            สร้างใบสั่งซื้อ
          </Button>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                รายการสั่งซื้อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ผู้จำหน่าย</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ยอดรวม</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{purchase.docNo}</td>
                        <td className="px-4 py-3 text-sm">{purchase.date}</td>
                        <td className="px-4 py-3">{purchase.supplier}</td>
                        <td className="px-4 py-3 font-semibold">{purchase.amount}</td>
                        <td className="px-4 py-3">{getStatusBadge(purchase.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {purchase.status === "PENDING" && (
                              <Button variant="outline" size="sm">
                                รับสินค้า
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </div>
    </MainLayout>
  );
};

export default Purchases;
