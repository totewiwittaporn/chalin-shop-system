import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Package, Users, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
                    <SheetContent side="left" className="p-0 w-64">
                      <AppSidebar />
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