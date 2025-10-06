import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, FileText } from "lucide-react";

const Sales = () => {

  const sales = [
    { id: 1, docNo: "INV-JW-202501-045", date: "2025-01-06 14:35", branch: "J Avenue", customer: "ลูกค้าทั่วไป", amount: "฿2,450", status: "PAID" },
    { id: 2, docNo: "INV-MAIN-202501-128", date: "2025-01-06 13:20", branch: "สาขาหลัก", customer: "คุณสมชาย", amount: "฿5,280", status: "PAID" },
    { id: 3, docNo: "INV-SAND-202501-032", date: "2025-01-06 11:15", branch: "The Sand", customer: "Walk-in Customer", amount: "฿8,750", status: "PAID" },
  ];

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ขายสินค้า / Sales</h2>
            <p className="text-sm text-muted-foreground">บันทึกการขายและออกใบเสร็จ</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            บันทึกการขายใหม่
          </Button>
        </div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">฿42,580</div>
                <p className="text-sm text-muted-foreground">ยอดขายวันนี้</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">28</div>
                <p className="text-sm text-muted-foreground">รายการขายวันนี้</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">฿1,520</div>
                <p className="text-sm text-muted-foreground">ยอดเฉลี่ยต่อบิล</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                รายการขาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่ใบเสร็จ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่-เวลา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ลูกค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ยอดรวม</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{sale.docNo}</td>
                        <td className="px-4 py-3 text-sm">{sale.date}</td>
                        <td className="px-4 py-3">{sale.branch}</td>
                        <td className="px-4 py-3">{sale.customer}</td>
                        <td className="px-4 py-3 font-semibold">{sale.amount}</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">ชำระแล้ว</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              พิมพ์
                            </Button>
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

export default Sales;
