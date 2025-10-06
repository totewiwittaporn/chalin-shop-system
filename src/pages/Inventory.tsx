import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Warehouse, Search, Package, TrendingDown, TrendingUp } from "lucide-react";

const Inventory = () => {
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const inventory = [
    { id: 1, sku: "HP-001", product: "กิ๊บติดผมเล็ก", branch: "สาขาหลัก", qty: 156, minStock: 50, status: "sufficient" },
    { id: 2, sku: "ER-001", product: "ต่างหูห้อย", branch: "J Avenue", qty: 23, minStock: 30, status: "low" },
    { id: 3, sku: "BR-001", product: "กำไลทอง", branch: "The Sand", qty: 45, minStock: 20, status: "sufficient" },
    { id: 4, sku: "NK-001", product: "สร้อยคอทอง", branch: "สาขาหลัก", qty: 8, minStock: 15, status: "critical" },
  ];

  const getStatusBadge = (status: string, qty: number, minStock: number) => {
    if (status === "critical") {
      return <Badge variant="destructive" className="gap-1"><TrendingDown className="h-3 w-3" />ต่ำกว่าขั้นต่ำ</Badge>;
    }
    if (status === "low") {
      return <Badge variant="secondary" className="gap-1"><TrendingDown className="h-3 w-3" />ใกล้หมด</Badge>;
    }
    return <Badge variant="default" className="gap-1"><TrendingUp className="h-3 w-3" />เพียงพอ</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="/inventory" onNavigate={handleNavigate} />

      <div className="flex-1 overflow-auto">
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">คลังสินค้า / Inventory</h1>
                <p className="text-sm text-muted-foreground">ตรวจสอบและจัดการสต็อกสินค้า</p>
              </div>
              <Button className="gap-2">
                <Package className="h-4 w-4" />
                ปรับปรุงสต็อก
              </Button>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">รายการสินค้าทั้งหมด</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">892</div>
                <p className="text-sm text-muted-foreground">สต็อกเพียงพอ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">248</div>
                <p className="text-sm text-muted-foreground">สต็อกใกล้หมด</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">107</div>
                <p className="text-sm text-muted-foreground">ต่ำกว่าขั้นต่ำ</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  รายการคลังสินค้า
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="ค้นหาสินค้า..." className="pl-9 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สินค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">คงเหลือ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ขั้นต่ำ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-mono">{item.sku}</td>
                        <td className="px-4 py-3 font-medium">{item.product}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.branch}</td>
                        <td className="px-4 py-3 font-semibold">{item.qty} ชิ้น</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.minStock} ชิ้น</td>
                        <td className="px-4 py-3">
                          {getStatusBadge(item.status, item.qty, item.minStock)}
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

export default Inventory;
