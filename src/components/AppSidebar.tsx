import { Home, Package, Layers, Building2, Warehouse, ShoppingCart, ArrowLeftRight, Receipt, FileText, FileBarChart, Settings, Users, UserCircle, Zap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-accent text-accent-foreground font-medium"
      : "hover:bg-accent/50 text-sidebar-foreground";

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton asChild>
            <NavLink to={item.path} className={getNavCls(item.path)}>
              <item.icon className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm">{item.label}</span>
                {open && (
                  <span className="text-xs text-muted-foreground">{item.labelEn}</span>
                )}
              </div>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>หลัก</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>คลังสินค้า</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(inventoryItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>การขาย</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(transactionItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>รายงาน</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(reportItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ระบบ</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(systemItems)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}