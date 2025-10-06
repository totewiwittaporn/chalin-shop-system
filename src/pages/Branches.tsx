import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, MapPin, Phone } from "lucide-react";

const Branches = () => {

  const branches = [
    { id: 1, code: "MAIN", name: "Chalin Shop (สาขาหลัก)", type: "MAIN", address: "123 ถนนสุขุมวิท กรุงเทพฯ", phone: "02-123-4567", status: "active" },
    { id: 2, code: "JW", name: "J Avenue", type: "BRANCH", address: "J Avenue Shopping Mall", phone: "02-234-5678", status: "active" },
    { id: 3, code: "SAND", name: "The Sand Khao Lak", type: "CONSIGNMENT", address: "Khao Lak Beach Resort", phone: "076-123-456", status: "active" },
    { id: 4, code: "RO", name: "RO Shop", type: "CONSIGNMENT", address: "Central Plaza", phone: "02-345-6789", status: "active" },
  ];

  const getBranchTypeColor = (type: string) => {
    switch (type) {
      case "MAIN": return "default";
      case "BRANCH": return "secondary";
      case "CONSIGNMENT": return "outline";
      default: return "outline";
    }
  };

  const getBranchTypeName = (type: string) => {
    switch (type) {
      case "MAIN": return "สาขาหลัก";
      case "BRANCH": return "สาขา";
      case "CONSIGNMENT": return "ร้านฝาก";
      default: return type;
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">สาขา & ร้านฝาก / Branches</h2>
            <p className="text-sm text-muted-foreground">จัดการสาขาและร้านฝากขาย</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มสาขาใหม่
          </Button>
        </div>
          <div className="grid md:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{branch.name}</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">{branch.code}</p>
                      </div>
                    </div>
                    <Badge variant={getBranchTypeColor(branch.type)}>
                      {getBranchTypeName(branch.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      ดูรายละเอียด
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      แก้ไข
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      </div>
    </MainLayout>
  );
};

export default Branches;
