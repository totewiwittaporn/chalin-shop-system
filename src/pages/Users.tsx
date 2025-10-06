import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, Plus, Edit, Trash2 } from "lucide-react";

const Users = () => {

  const users = [
    { id: 1, name: "Admin User", email: "admin@chalin.com", role: "ADMIN", branch: "ทั้งหมด", status: "active" },
    { id: 2, name: "Somchai Manager", email: "somchai@chalin.com", role: "STAFF", branch: "J Avenue", status: "active" },
    { id: 3, name: "The Sand Owner", email: "thesand@partner.com", role: "CONSIGNMENT_OWNER", branch: "The Sand", status: "active" },
    { id: 4, name: "RO Shop Owner", email: "ro@partner.com", role: "CONSIGNMENT_OWNER", branch: "RO Shop", status: "active" },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="default">แอดมิน</Badge>;
      case "STAFF":
        return <Badge variant="secondary">พนักงาน</Badge>;
      case "CONSIGNMENT_OWNER":
        return <Badge variant="outline">เจ้าของร้านฝาก</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ผู้ใช้งาน / Users</h2>
            <p className="text-sm text-muted-foreground">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มผู้ใช้งาน
          </Button>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                รายชื่อผู้ใช้งาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ชื่อ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">อีเมล</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">บทบาท</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3">{user.branch}</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">ใช้งาน</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </div>
    </MainLayout>
  );
};

export default Users;
