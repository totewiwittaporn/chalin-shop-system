import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, TrendingUp, Users, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: "การจัดการสินค้า",
      titleEn: "Inventory Management",
      description: "จัดการสต็อกสินค้าแบบเรียลไทม์ ทุกสาขาและร้านฝากขาย"
    },
    {
      icon: TrendingUp,
      title: "รายงานการขาย",
      titleEn: "Sales Reports",
      description: "ติดตามยอดขายและกำไร พร้อมกราฟวิเคราะห์แบบละเอียด"
    },
    {
      icon: Users,
      title: "หลายสาขา",
      titleEn: "Multi-Branch",
      description: "รองรับร้านหลัก สาขา และร้านฝากขาย ในระบบเดียว"
    },
    {
      icon: FileText,
      title: "เอกสารสองภาษา",
      titleEn: "Bilingual Documents",
      description: "สร้างเอกสารไทย-อังกฤษ ใบเสนอราคา ใบส่งของ ใบแจ้งหนี้"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-full shadow-md border border-border">
                <Package className="w-8 h-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Chalin Shop System
                </h1>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              ระบบจัดการร้านค้า<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                ครบวงจร
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Multi-Branch Retail Management System
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              จัดการสินค้า สต็อก ยอดขาย และเอกสารทางการค้าแบบมืออาชีพ
              รองรับหลายสาขาและร้านฝากขาย พร้อมรายงานแบบเรียลไทม์
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all duration-300 group"
                onClick={() => navigate("/auth")}
              >
                เข้าสู่ระบบ / Login
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-muted"
                onClick={() => navigate("/auth?mode=register")}
              >
                สมัครสมาชิก / Register
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            ฟีเจอร์หลัก
          </h3>
          <p className="text-lg text-muted-foreground">
            Key Features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-2 text-foreground">
                {feature.title}
              </h4>
              <p className="text-sm text-accent font-medium mb-3">
                {feature.titleEn}
              </p>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTJ2Mmgydi0yaC0yem0yLTJ2Mmgydi0yaC0yem0wLTJ2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptMC0ydjJoMnYtMmgtMnptMi0ydjJoMnYtMmgtMnptMC0ydjJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h3>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Ready to Get Started?
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/auth")}
            >
              เริ่มใช้งานเลย / Start Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">© 2025 Chalin Shop System. All rights reserved.</p>
            <p className="text-sm">Professional Retail Management Solution</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
