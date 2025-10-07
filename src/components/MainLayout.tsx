import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Package, Users, LogOut, Menu, Home, Layers, Building2, Warehouse, ShoppingCart, ArrowLeftRight, Receipt, FileText, FileBarChart, Settings, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface MainLayoutProps {
  children: ReactNode;
}

const mainItems = [
  { icon: Home, label: "แดชบอร์ด", labelEn: "Dashboard", path: "/dashboard" },
  { icon: UserCircle, label: "โปรไฟล์", labelEn: "Profile", path: "/profile" },
];

const inventoryItems = [
  { icon: Package, label: "สินค้า", labelEn: "Products", path: "/products" },
  { icon: Layers, label: "ประเภทสินค้า", labelEn: "Product Types", path: "/product-types" },
  { icon: Building2, label: "สาขา & ร้านฝาก", labelEn: "Branches", path: "/branches" },
  { icon: Warehouse, label: "คลังสินค้า", labelEn: "Inventory", path: "/inventory" },
];

const transactionItems = [
  { icon: ShoppingCart, label: "ซื้อสินค้า", labelEn: "Purchases", path: "/purchases" },
  { icon: ArrowLeftRight, label: "โอนสินค้า", labelEn: "Transfers", path: "/transfers" },
  { icon: Zap, label: "POS - ขายด่วน", labelEn: "Quick Sale", path: "/pos" },
  { icon: Receipt, label: "ขายสินค้า (ฝากขาย)", labelEn: "Consignment", path: "/sales" },
];

const reportItems = [
  { icon: FileBarChart, label: "รายงานฝากขาย", labelEn: "Reports", path: "/consignment-reports" },
  { icon: FileText, label: "ใบเสนอราคา", labelEn: "Quotations", path: "/quotations" },
];

const systemItems = [
  { icon: Users, label: "ผู้ใช้งาน", labelEn: "Users", path: "/users" },
  { icon: Settings, label: "ตั้งค่าระบบ", labelEn: "Settings", path: "/settings" },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => currentPath === path;

  const MobileMenuItem = ({ item }: { item: typeof mainItems[0] }) => (
    <NavLink
      to={item.path}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive(item.path)
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground"
      }`}
    >
      <item.icon className="h-5 w-5" />
      <div className="flex flex-col items-start">
        <span className="text-sm">{item.label}</span>
        <span className="text-xs text-muted-foreground">{item.labelEn}</span>
      </div>
    </NavLink>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        {!isMobile && <AppSidebar />}

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 w-full">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-border bg-card">
            <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6 gap-4">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile Menu Trigger */}
                {isMobile ? (
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 bg-card">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-6">
                          {/* Logo */}
                          <div className="flex items-center gap-2 mb-6">
                            <Package className="h-6 w-6 text-primary" />
                            <div>
                              <h2 className="text-lg font-bold">Chalin Shop</h2>
                              <p className="text-xs text-muted-foreground">Inventory System</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Main Section */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">หลัก</h3>
                            {mainItems.map((item) => (
                              <MobileMenuItem key={item.path} item={item} />
                            ))}
                          </div>

                          <Separator />

                          {/* Inventory Section */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">คลังสินค้า</h3>
                            {inventoryItems.map((item) => (
                              <MobileMenuItem key={item.path} item={item} />
                            ))}
                          </div>

                          <Separator />

                          {/* Transaction Section */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">การขาย</h3>
                            {transactionItems.map((item) => (
                              <MobileMenuItem key={item.path} item={item} />
                            ))}
                          </div>

                          <Separator />

                          {/* Report Section */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">รายงาน</h3>
                            {reportItems.map((item) => (
                              <MobileMenuItem key={item.path} item={item} />
                            ))}
                          </div>

                          <Separator />

                          {/* System Section */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">ระบบ</h3>
                            {systemItems.map((item) => (
                              <MobileMenuItem key={item.path} item={item} />
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <SidebarTrigger />
                )}

                {/* Logo & Brand */}
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <div className="hidden sm:block">
                    <h1 className="text-base md:text-lg font-bold text-foreground">Chalin Shop</h1>
                    <p className="text-xs text-muted-foreground hidden md:block">Inventory System</p>
                  </div>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">แอดมิน</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size={isMobile ? "icon" : "sm"}
                  className={isMobile ? "" : "gap-2"}
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-4 w-4" />
                  {!isMobile && <span className="hidden sm:inline">ออกจากระบบ</span>}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};