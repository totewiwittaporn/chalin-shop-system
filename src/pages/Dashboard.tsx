import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  const { data: roles } = useUserRole();

  const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
  const isStaff = roles?.some((r: any) => r.role === "staff") ?? false;
  const isConsignmentOwner = roles?.some((r: any) => r.role === "consignment_owner") ?? false;

  // Get user's branch name for consignment owners
  const userBranch = roles?.find((r: any) => r.branch_id)?.branches;

  const stats = [
    {
      title: "ยอดขายวันนี้",
      titleEn: "Today's Sales",
      value: statsData ? `฿${statsData.todaySales.toLocaleString()}` : "฿0",
      change: statsData ? `${statsData.salesChange > 0 ? "+" : ""}${statsData.salesChange.toFixed(1)}%` : "0%",
      trend: statsData && statsData.salesChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "คำสั่งซื้อ",
      titleEn: "Orders",
      value: statsData ? statsData.ordersCount.toString() : "0",
      change: statsData ? `${statsData.ordersChange > 0 ? "+" : ""}${statsData.ordersChange}` : "0",
      trend: statsData && statsData.ordersChange >= 0 ? "up" : "down",
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      title: "สินค้าในคลัง",
      titleEn: "Stock Items",
      value: statsData ? statsData.totalStock.toLocaleString() : "0",
      change: "-",
      trend: "up",
      icon: Package,
      color: "text-accent",
    },
    {
      title: isConsignmentOwner ? "สาขาของฉัน" : "สาขาทั้งหมด",
      titleEn: isConsignmentOwner ? "My Branch" : "Total Branches",
      value: statsData ? statsData.branchCount.toString() : "0",
      change: "-",
      trend: "up",
      icon: Warehouse,
      color: "text-secondary",
    },
  ];

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ภาพรวม</h2>
            <p className="text-sm text-muted-foreground">Overview</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {isConsignmentOwner && userBranch
              ? `${userBranch.name_th} / Consignment Branch`
              : isAdmin
              ? "แอดมิน / Admin"
              : "พนักงาน / Staff"}
          </Badge>
        </div>
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="bg-gradient-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-9 w-24 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </CardContent>
                </Card>
              ))
          ) : (
            stats.map((stat, index) => (
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
                    {stat.change !== "-" && (
                      <>
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                        <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>
                          {stat.change}
                        </span>
                        <span className="text-muted-foreground">จากเมื่อวาน</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
              {activitiesLoading ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/30">
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium mb-1">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(activity.time, {
                              addSuffix: true,
                              locale: th,
                            })}
                          </p>
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
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  ยังไม่มีกิจกรรม
                </div>
              )}
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
              <Button
                className="w-full justify-start bg-gradient-primary hover:shadow-md transition-all"
                onClick={() => navigate("/sales")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                บันทึกการขาย / New Sale
              </Button>
              {(isAdmin || isStaff) && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/products")}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    เพิ่มสินค้า / Add Product
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/transfers")}
                  >
                    <Warehouse className="w-4 h-4 mr-2" />
                    โอนสินค้า / Transfer
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/quotations")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    ใบเสนอราคา / Quotation
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(isConsignmentOwner ? "/consignment-reports" : "/dashboard")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {isConsignmentOwner ? "รายงานของฉัน / My Reports" : "รายงาน / Reports"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        {statsData && statsData.todaySales === 0 && (
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
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/sales")}
                >
                  เริ่มต้นใช้งาน
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
