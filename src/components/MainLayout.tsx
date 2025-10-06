import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold text-foreground">ระบบบริหารจัดการสต็อกและการขายสินค้าฝาก</h1>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1">
        <Sidebar activeItem={location.pathname} onNavigate={handleNavigate} />
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
