import { Home, Package, Layers, Building2, Warehouse, ShoppingCart, ArrowLeftRight, Receipt, FileText, FileBarChart, Settings, Users, LogOut, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

const menuItems = [
  { icon: Home, label: "แดชบอร์ด", labelEn: "Dashboard", path: "/dashboard" },
  { icon: UserCircle, label: "โปรไฟล์", labelEn: "Profile", path: "/profile" },
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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
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

          {/* Logout Menu Item */}
          <div className="pt-4 mt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">ออกจากระบบ</span>
                <span className="text-xs">Logout</span>
              </div>
            </Button>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}
