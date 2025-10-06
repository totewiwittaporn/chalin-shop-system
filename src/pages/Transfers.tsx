import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Plus, FileText } from "lucide-react";

const Transfers = () => {
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const transfers = [
    { id: 1, docNo: "TRF-202501-001", date: "2025-01-06", from: "สาขาหลัก", to: "J Avenue", items: 45, status: "COMPLETED" },
    { id: 2, docNo: "TRF-202501-002", date: "2025-01-06", from: "สาขาหลัก", to: "The Sand", items: 61, status: "IN_TRANSIT" },
    { id: 3, docNo: "TRF-202501-003", date: "2025-01-05", from: "J Avenue", to: "สาขาหลัก", items: 12, status: "COMPLETED" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">สำเร็จ</Badge>;
      case "IN_TRANSIT":
        return <Badge variant="secondary">กำลังส่ง</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="/transfers" onNavigate={handleNavigate} />

      <div className="flex-1 overflow-auto">
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">โอนสินค้า / Transfers</h1>
                <p className="text-sm text-muted-foreground">โอนสินค้าระหว่างสาขา</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                สร้างใบโอนสินค้า
              </Button>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                รายการโอนสินค้า
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">จาก</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ไปยัง</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">จำนวนรายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((transfer) => (
                      <tr key={transfer.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{transfer.docNo}</td>
                        <td className="px-4 py-3 text-sm">{transfer.date}</td>
                        <td className="px-4 py-3">{transfer.from}</td>
                        <td className="px-4 py-3">{transfer.to}</td>
                        <td className="px-4 py-3 text-center">{transfer.items} รายการ</td>
                        <td className="px-4 py-3">{getStatusBadge(transfer.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {transfer.status === "IN_TRANSIT" && (
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
        </main>
      </div>
    </div>
  );
};

export default Transfers;
