import { Home, Package, Layers, Building2, Warehouse, ShoppingCart, ArrowLeftRight, Receipt, FileText, FileBarChart, Settings, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

const menuItems = [
  { icon: Home, label: "แดชบอร์ด", labelEn: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "สินค้า", labelEn: "Products", path: "/products" },
  { icon: Layers, label: "ประเภทสินค้า", labelEn: "Product Types", path: "/product-types" },
  { icon: Building2, label: "สาขา & ร้านฝาก", labelEn: "Branches & Consignment", path: "/branches" },
  { icon: Warehouse, label: "คลังสินค้า", labelEn: "Inventory", path: "/inventory" },
  { icon: ShoppingCart, label: "ซื้อสินค้า", labelEn: "Purchases", path: "/purchases" },
  { icon: ArrowLeftRight, label: "โอนสินค้า", labelEn: "Transfers", path: "/transfers" },
  { icon: Receipt, label: "ขายสินค้า", labelEn: "Sales", path: "/sales" },
  { icon: FileBarChart, label: "รายงานฝากขาย", labelEn: "Consignment Reports", path: "/consignment-reports" },
  { icon: FileText, label: "ใบเสนอราคา", labelEn: "Quotations", path: "/quotations" },
  { icon: Users, label: "ผู้ใช้งาน", labelEn: "Users", path: "/users" },
  { icon: Settings, label: "ตั้งค่าระบบ", labelEn: "Settings", path: "/settings" },
];

export function Sidebar({ activeItem = "/dashboard", onNavigate }: SidebarProps) {
  const handleLogout = () => {
    // TODO: Implement logout logic
    window.location.href = "/auth";
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo & Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Package className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">Chalin Shop</h1>
          <p className="text-xs text-muted-foreground">Inventory System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )}
                onClick={() => onNavigate?.(item.path)}
              >
                <Icon className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.labelEn}</span>
                </div>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground">แอดมิน</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>ออกจากระบบ / Logout</span>
        </Button>
      </div>
    </div>
  );
}
