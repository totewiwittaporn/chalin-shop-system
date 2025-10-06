import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Download, Eye } from "lucide-react";

const ConsignmentReports = () => {

  const reports = [
    { id: 1, shop: "The Sand Khao Lak", period: "ม.ค. 2025", sent: 150, sold: 89, remaining: 61, revenue: "฿48,560", status: "active" },
    { id: 2, shop: "RO Shop", period: "ม.ค. 2025", sent: 120, sold: 76, remaining: 44, revenue: "฿38,420", status: "active" },
    { id: 3, shop: "Little Cafe", period: "ธ.ค. 2024", sent: 200, sold: 185, remaining: 15, revenue: "฿92,750", status: "settled" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">กำลังดำเนินการ</Badge>;
      case "settled":
        return <Badge variant="secondary">ชำระแล้ว</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">รายงานฝากขาย / Consignment Reports</h2>
            <p className="text-sm text-muted-foreground">สรุปยอดขายและสต็อกร้านฝาก</p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            ส่งออกรายงาน
          </Button>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                รายงานร้านฝากขาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ร้านฝาก</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">งวด</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">ส่งไป</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">ขายได้</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">คงเหลือ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ยอดขาย</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{report.shop}</td>
                        <td className="px-4 py-3">{report.period}</td>
                        <td className="px-4 py-3 text-center">{report.sent} ชิ้น</td>
                        <td className="px-4 py-3 text-center text-success font-medium">{report.sold} ชิ้น</td>
                        <td className="px-4 py-3 text-center">{report.remaining} ชิ้น</td>
                        <td className="px-4 py-3 font-semibold">{report.revenue}</td>
                        <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
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

export default ConsignmentReports;
