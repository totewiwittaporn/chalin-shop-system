import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import {
  Package,
  TrendingUp,
  Users,
  FileText,
  ShoppingCart,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const Dashboard = () => {
  const handleNavigate = (path: string) => {
    console.log("Navigate to:", path);
    // TODO: Implement navigation with React Router
  };

  const stats = [
    {
      title: "ยอดขายวันนี้",
      titleEn: "Today's Sales",
      value: "฿42,580",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "คำสั่งซื้อ",
      titleEn: "Orders",
      value: "28",
      change: "+8",
      trend: "up",
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      title: "สินค้าในคลัง",
      titleEn: "Stock Items",
      value: "1,247",
      change: "-23",
      trend: "down",
      icon: Package,
      color: "text-accent",
    },
    {
      title: "สาขาทั้งหมด",
      titleEn: "Total Branches",
      value: "8",
      change: "+1",
      trend: "up",
      icon: Warehouse,
      color: "text-secondary",
    },
  ];

  const recentActivity = [
    {
      type: "sale",
      description: "ขายสินค้าที่ สาขา JW",
      amount: "฿2,450",
      time: "5 นาทีที่แล้ว",
      status: "completed",
    },
    {
      type: "transfer",
      description: "โอนสินค้าไป The Sand Khao Lak",
      amount: "61 ชิ้น",
      time: "2 ชั่วโมงที่แล้ว",
      status: "pending",
    },
    {
      type: "purchase",
      description: "รับสินค้าเข้าคลังหลัก",
      amount: "฿45,000",
      time: "5 ชั่วโมงที่แล้ว",
      status: "completed",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Sidebar */}
      <Sidebar activeItem="/dashboard" onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">แดชบอร์ด</h1>
                <p className="text-muted-foreground">Dashboard - Overview</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  สาขาหลัก / Main Branch
                </Badge>
                <Button variant="outline">ตั้งค่า</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                  <span className="block text-xs mt-1">{stat.titleEn}</span>
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                  <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">จากเมื่อวาน</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                กิจกรรมล่าสุด
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  Recent Activity
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium mb-1">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">{activity.amount}</p>
                      <Badge
                        variant={activity.status === "completed" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {activity.status === "completed" ? "สำเร็จ" : "รอดำเนินการ"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                ดูทั้งหมด / View All
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                เมนูด่วน
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  Quick Actions
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-primary hover:shadow-md transition-all">
                <ShoppingCart className="w-4 h-4 mr-2" />
                บันทึกการขาย / New Sale
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                เพิ่มสินค้า / Add Product
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Warehouse className="w-4 h-4 mr-2" />
                โอนสินค้า / Transfer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                ใบเสนอราคา / Quotation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                รายงาน / Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="mt-6 bg-gradient-primary border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary-foreground mb-2">
                  🎉 ระบบพร้อมใช้งานแล้ว!
                </h3>
                <p className="text-primary-foreground/90">
                  System is ready! เริ่มต้นจัดการร้านค้าของคุณได้เลย
                </p>
              </div>
              <Button variant="secondary" size="lg">
                เริ่มต้นใช้งาน
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
