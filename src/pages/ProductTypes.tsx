import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Search, Edit, Trash2 } from "lucide-react";

const ProductTypes = () => {

  const types = [
    { id: 1, code: "HP", name: "กิ๊บติดผม", nameEn: "Hair Clips", productCount: 45, description: "เครื่องประดับติดผม" },
    { id: 2, code: "ER", name: "ต่างหู", nameEn: "Earrings", productCount: 67, description: "ต่างหูแบบต่างๆ" },
    { id: 3, code: "BR", name: "กำไล", nameEn: "Bracelets", productCount: 32, description: "กำไลและสร้อยข้อมือ" },
    { id: 4, code: "NK", name: "สร้อยคอ", nameEn: "Necklaces", productCount: 28, description: "สร้อยคอทุกชนิด" },
  ];

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ประเภทสินค้า / Product Types</h2>
            <p className="text-sm text-muted-foreground">จัดการหมวดหมู่สินค้า</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มประเภทใหม่
          </Button>
        </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  รายการประเภทสินค้า
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="ค้นหาประเภท..." className="pl-9 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {types.map((type) => (
                  <Card key={type.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            {type.code}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{type.name}</h3>
                            <p className="text-sm text-muted-foreground">{type.nameEn}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                      <Badge variant="secondary">
                        {type.productCount} สินค้า
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
      </div>
    </MainLayout>
  );
};

export default ProductTypes;
