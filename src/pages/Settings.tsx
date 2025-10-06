import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, FileText, Palette, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ / Settings</h2>
          <p className="text-sm text-muted-foreground">กำหนดค่าและปรับแต่งระบบ</p>
        </div>
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="company">ข้อมูลบริษัท</TabsTrigger>
              <TabsTrigger value="documents">เอกสาร</TabsTrigger>
              <TabsTrigger value="appearance">การแสดงผล</TabsTrigger>
              <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
            </TabsList>

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
      </div>
    </MainLayout>
  );
};

export default Settings;
