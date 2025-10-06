import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Palette, Bell, DollarSign, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceDialog } from "@/components/pricing/PriceDialog";
import { usePricing } from "@/hooks/usePricing";
import { useProducts } from "@/hooks/useProducts";
import { useProductTypes } from "@/hooks/useProductTypes";
import { useBranches } from "@/hooks/useBranches";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter, isBefore } from "date-fns";

const Settings = () => {
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [priceDialogType, setPriceDialogType] = useState<"standard-product" | "standard-type" | "shop-product" | "shop-type">("standard-product");
  const [priceDialogTitle, setPriceDialogTitle] = useState("");
  
  const { products } = useProducts();
  const { productTypes } = useProductTypes();
  const { branches } = useBranches();
  const {
    standardProductPrices,
    isLoadingStandardProduct,
    createStandardProductPrice,
    standardTypePrices,
    isLoadingStandardType,
    createStandardTypePrice,
    shopProductPrices,
    isLoadingShopProduct,
    createShopProductPrice,
    shopTypePrices,
    isLoadingShopType,
    createShopTypePrice,
  } = usePricing();

  const openPriceDialog = (type: typeof priceDialogType, title: string) => {
    setPriceDialogType(type);
    setPriceDialogTitle(title);
    setPriceDialogOpen(true);
  };

  const handlePriceSubmit = async (data: any) => {
    switch (priceDialogType) {
      case "standard-product":
        await createStandardProductPrice(data);
        break;
      case "standard-type":
        await createStandardTypePrice(data);
        break;
      case "shop-product":
        await createShopProductPrice(data);
        break;
      case "shop-type":
        await createShopTypePrice(data);
        break;
    }
  };

  const getStatusBadge = (effectiveFrom: string, effectiveTo?: string) => {
    const now = new Date();
    const from = new Date(effectiveFrom);
    const to = effectiveTo ? new Date(effectiveTo) : null;

    if (isBefore(now, from)) {
      return <Badge variant="outline">จะใช้งาน</Badge>;
    }
    if (to && isAfter(now, to)) {
      return <Badge variant="outline" className="text-muted-foreground">หมดอายุ</Badge>;
    }
    return <Badge variant="default">ใช้งานอยู่</Badge>;
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ / Settings</h2>
          <p className="text-sm text-muted-foreground">กำหนดค่าและปรับแต่งระบบ</p>
        </div>
          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="pricing">จัดการราคา</TabsTrigger>
              <TabsTrigger value="company">ข้อมูลบริษัท</TabsTrigger>
              <TabsTrigger value="documents">เอกสาร</TabsTrigger>
              <TabsTrigger value="appearance">การแสดงผล</TabsTrigger>
              <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="space-y-6">
              {/* Standard Product Prices */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      ราคามาตรฐาน - รายสินค้า
                    </CardTitle>
                    <Button size="sm" onClick={() => openPriceDialog("standard-product", "เพิ่มราคามาตรฐาน - รายสินค้า")}>
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มราคา
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingStandardProduct ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : standardProductPrices && standardProductPrices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สินค้า</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ราคา</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ตั้งแต่</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ถึง</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standardProductPrices.slice(0, 10).map((price) => (
                            <tr key={price.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-2 text-sm">
                                {price.products?.name_th} ({price.products?.sku})
                              </td>
                              <td className="px-4 py-2 font-semibold">
                                ฿{price.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {format(new Date(price.effective_from), "dd/MM/yyyy")}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {price.effective_to ? format(new Date(price.effective_to), "dd/MM/yyyy") : "ไม่จำกัด"}
                              </td>
                              <td className="px-4 py-2">
                                {getStatusBadge(price.effective_from, price.effective_to)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">ยังไม่มีราคามาตรฐาน</p>
                  )}
                </CardContent>
              </Card>

              {/* Standard Type Prices */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      ราคามาตรฐาน - รายประเภท
                    </CardTitle>
                    <Button size="sm" onClick={() => openPriceDialog("standard-type", "เพิ่มราคามาตรฐาน - รายประเภท")}>
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มราคา
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingStandardType ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : standardTypePrices && standardTypePrices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ประเภทสินค้า</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ราคา</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ตั้งแต่</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ถึง</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standardTypePrices.slice(0, 10).map((price) => (
                            <tr key={price.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-2 text-sm">
                                {price.product_types?.name_th} ({price.product_types?.code})
                              </td>
                              <td className="px-4 py-2 font-semibold">
                                ฿{price.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {format(new Date(price.effective_from), "dd/MM/yyyy")}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {price.effective_to ? format(new Date(price.effective_to), "dd/MM/yyyy") : "ไม่จำกัด"}
                              </td>
                              <td className="px-4 py-2">
                                {getStatusBadge(price.effective_from, price.effective_to)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">ยังไม่มีราคามาตรฐาน</p>
                  )}
                </CardContent>
              </Card>

              {/* Shop Product Prices */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      ราคาร้านค้า - รายสินค้า
                    </CardTitle>
                    <Button size="sm" onClick={() => openPriceDialog("shop-product", "เพิ่มราคาร้านค้า - รายสินค้า")}>
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มราคา
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingShopProduct ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : shopProductPrices && shopProductPrices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สินค้า</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ราคา</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ตั้งแต่</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ถึง</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shopProductPrices.slice(0, 10).map((price) => (
                            <tr key={price.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-2 text-sm">{price.branches?.name_th}</td>
                              <td className="px-4 py-2 text-sm">
                                {price.products?.name_th} ({price.products?.sku})
                              </td>
                              <td className="px-4 py-2 font-semibold">
                                ฿{price.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {format(new Date(price.effective_from), "dd/MM/yyyy")}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {price.effective_to ? format(new Date(price.effective_to), "dd/MM/yyyy") : "ไม่จำกัด"}
                              </td>
                              <td className="px-4 py-2">
                                {getStatusBadge(price.effective_from, price.effective_to)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">ยังไม่มีราคาร้านค้า</p>
                  )}
                </CardContent>
              </Card>

              {/* Shop Type Prices */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      ราคาร้านค้า - รายประเภท
                    </CardTitle>
                    <Button size="sm" onClick={() => openPriceDialog("shop-type", "เพิ่มราคาร้านค้า - รายประเภท")}>
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มราคา
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingShopType ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : shopTypePrices && shopTypePrices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ประเภทสินค้า</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ราคา</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ตั้งแต่</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">ใช้ได้ถึง</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shopTypePrices.slice(0, 10).map((price) => (
                            <tr key={price.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-2 text-sm">{price.branches?.name_th}</td>
                              <td className="px-4 py-2 text-sm">
                                {price.product_types?.name_th} ({price.product_types?.code})
                              </td>
                              <td className="px-4 py-2 font-semibold">
                                ฿{price.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {format(new Date(price.effective_from), "dd/MM/yyyy")}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {price.effective_to ? format(new Date(price.effective_to), "dd/MM/yyyy") : "ไม่จำกัด"}
                              </td>
                              <td className="px-4 py-2">
                                {getStatusBadge(price.effective_from, price.effective_to)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">ยังไม่มีราคาร้านค้า</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    ข้อมูลบริษัท / Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ชื่อบริษัท (ไทย)</Label>
                      <Input placeholder="ชาลิน ช็อป จำกัด" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name (English)</Label>
                      <Input placeholder="Chalin Shop Co., Ltd." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ที่อยู่ / Address</Label>
                    <Input placeholder="123 ถนนสุขุมวิท แขวงคลองเตย..." />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>เลขประจำตัวผู้เสียภาษี</Label>
                      <Input placeholder="0123456789012" />
                    </div>
                    <div className="space-y-2">
                      <Label>เบอร์โทรศัพท์</Label>
                      <Input placeholder="02-123-4567" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>อีเมล</Label>
                    <Input type="email" placeholder="info@chalin.com" />
                  </div>
                  <Button>บันทึกการเปลี่ยนแปลง</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    การตั้งค่าเอกสาร / Document Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-3">รูปแบบเลขที่เอกสาร / Document Numbering</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Label className="w-32">ใบเสร็จ (Invoice)</Label>
                          <Input placeholder="INV-{branchCode}-{YYYYMM}-{running}" className="flex-1" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Label className="w-32">ใบส่งสินค้า (Delivery)</Label>
                          <Input placeholder="DLV-{branchCode}-{YYYYMM}-{running}" className="flex-1" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Label className="w-32">ใบเสนอราคา (Quotation)</Label>
                          <Input placeholder="QO-{branchCode}-{YYYYMM}-{running}" className="flex-1" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">ข้อความท้ายเอกสาร / Footer Text</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>ภาษาไทย</Label>
                          <Input placeholder="ขอบคุณที่ใช้บริการ" />
                        </div>
                        <div>
                          <Label>English</Label>
                          <Input placeholder="Thank you for your business" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button>บันทึกการตั้งค่า</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    การแสดงผล / Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ธีมสี / Color Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <div className="h-8 bg-gradient-primary rounded mb-2"></div>
                        <p className="text-sm text-center">Dark Blue</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <div className="h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded mb-2"></div>
                        <p className="text-sm text-center">Green</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                        <div className="h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded mb-2"></div>
                        <p className="text-sm text-center">Purple</p>
                      </div>
                    </div>
                  </div>
                  <Button>บันทึกการเปลี่ยนแปลง</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    การแจ้งเตือน / Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">แจ้งเตือนสต็อกต่ำ</p>
                        <p className="text-sm text-muted-foreground">แจ้งเมื่อสต็อกใกล้หมด</p>
                      </div>
                      <Button variant="outline" size="sm">เปิด</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">แจ้งเตือนการขาย</p>
                        <p className="text-sm text-muted-foreground">แจ้งเมื่อมีการขายใหม่</p>
                      </div>
                      <Button variant="outline" size="sm">เปิด</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">แจ้งเตือนใบเสนอราคา</p>
                        <p className="text-sm text-muted-foreground">แจ้งเมื่อใบเสนอราคาใกล้หมดอายุ</p>
                      </div>
                      <Button variant="outline" size="sm">เปิด</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <PriceDialog
            open={priceDialogOpen}
            onOpenChange={setPriceDialogOpen}
            onSubmit={handlePriceSubmit}
            title={priceDialogTitle}
            type={priceDialogType}
            products={products}
            productTypes={productTypes}
            branches={branches}
          />
      </div>
    </MainLayout>
  );
};

export default Settings;
