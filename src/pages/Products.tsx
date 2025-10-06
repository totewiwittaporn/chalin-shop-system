import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";

const Products = () => {
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const products = [
    { id: 1, sku: "HP-001", name: "กิ๊บติดผมเล็ก", nameEn: "Small Hair Clip", type: "กิ๊บติดผม", price: "฿45.00", stock: 156 },
    { id: 2, sku: "ER-001", name: "ต่างหูห้อย", nameEn: "Hanging Earrings", type: "ต่างหู", price: "฿120.00", stock: 89 },
    { id: 3, sku: "BR-001", name: "กำไลทอง", nameEn: "Gold Bracelet", type: "กำไล", price: "฿280.00", stock: 45 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="/products" onNavigate={handleNavigate} />

      <div className="flex-1 overflow-auto">
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">สินค้า / Products</h1>
                <p className="text-sm text-muted-foreground">จัดการข้อมูลสินค้าทั้งหมด</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                เพิ่มสินค้าใหม่
              </Button>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  รายการสินค้า
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="ค้นหาสินค้า..." className="pl-9 w-64" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ชื่อสินค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ประเภท</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ราคา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">คงเหลือ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-mono">{product.sku}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.nameEn}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{product.type}</Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold">{product.price}</td>
                        <td className="px-4 py-3">
                          <Badge variant={product.stock > 50 ? "default" : "destructive"}>
                            {product.stock} ชิ้น
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
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
        </main>
      </div>
    </div>
  );
};

export default Products;
