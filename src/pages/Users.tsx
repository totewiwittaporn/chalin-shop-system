import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useUsers, useDeleteUserRole } from "@/hooks/useUsers";
import { UserDialog } from "@/components/users/UserDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Users = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  
  const { data: users, isLoading } = useUsers();
  const deleteRoleMutation = useDeleteUserRole();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">แอดมิน</Badge>;
      case "staff":
        return <Badge variant="secondary">พนักงาน</Badge>;
      case "consignment_owner":
        return <Badge variant="outline">เจ้าของร้านฝาก</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleDeleteRole = async () => {
    if (deleteRoleId) {
      await deleteRoleMutation.mutateAsync(deleteRoleId);
      setDeleteRoleId(null);
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
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
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
                    {isLoading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="px-4 py-3" colSpan={6}>
                              <Skeleton className="h-8 w-full" />
                            </td>
                          </tr>
                        ))
                    ) : users && users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{user.full_name || user.email}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <div key={role.id}>{getRoleBadge(role.role)}</div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {user.roles.map((role) => (
                              <div key={role.id}>
                                {role.branch ? role.branch.name_th : "ทั้งหมด"}
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="default">ใช้งาน</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {user.roles.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteRoleId(user.roles[0].id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          ไม่มีข้อมูลผู้ใช้งาน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </div>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบบทบาทนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Users;
