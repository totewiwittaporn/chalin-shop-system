import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Download } from "lucide-react";

const Quotations = () => {

  const quotations = [
    { id: 1, docNo: "QO-MAIN-202501-003", date: "2025-01-06", customer: "New Cafe & Restaurant", amount: "฿125,000", validUntil: "2025-01-20", status: "SENT" },
    { id: 2, docNo: "QO-MAIN-202501-002", date: "2025-01-04", customer: "Beach Resort Shop", amount: "฿89,500", validUntil: "2025-01-18", status: "ACCEPTED" },
    { id: 3, docNo: "QO-MAIN-202501-001", date: "2025-01-02", customer: "Shopping Mall Booth", amount: "฿156,800", validUntil: "2025-01-16", status: "DRAFT" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">ฉบับร่าง</Badge>;
      case "SENT":
        return <Badge variant="secondary">ส่งแล้ว</Badge>;
      case "ACCEPTED":
        return <Badge variant="default">ตอบรับแล้ว</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">ปฏิเสธ</Badge>;
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground">หมดอายุ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ใบเสนอราคา / Quotations</h2>
            <p className="text-sm text-muted-foreground">สร้างและจัดการใบเสนอราคาสองภาษา</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            สร้างใบเสนอราคาใหม่
          </Button>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                รายการใบเสนอราคา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ลูกค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">มูลค่า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ใช้ได้ถึง</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{quotation.docNo}</td>
                        <td className="px-4 py-3 text-sm">{quotation.date}</td>
                        <td className="px-4 py-3 font-medium">{quotation.customer}</td>
                        <td className="px-4 py-3 font-semibold">{quotation.amount}</td>
                        <td className="px-4 py-3 text-sm">{quotation.validUntil}</td>
                        <td className="px-4 py-3">{getStatusBadge(quotation.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
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

export default Quotations;
