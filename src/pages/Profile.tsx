import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Shield, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranches } from "@/hooks/useBranches";

const Profile = () => {
  const { user } = useAuth();
  const { data: roles } = useUserRole();
  const { branches } = useBranches();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRoleEditing, setIsRoleEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [roleFormData, setRoleFormData] = useState<
    Record<string, { role: string; branch_id: string | null }>
  >({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
      });

      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      if (!user?.id) throw new Error("No user");

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("อัพเดทข้อมูลสำเร็จ");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      // First verify current password
      if (!user?.email) throw new Error("No user email");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง");

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: async (
      updates: Array<{ id: string; role: string; branch_id: string | null }>
    ) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("user_roles")
          .update({
            role: update.role,
            branch_id: update.branch_id,
          })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-role", user?.id] });
      toast.success("อัพเดทบทบาทสำเร็จ");
      setIsRoleEditing(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const startRoleEditing = () => {
    if (roles && roles.length > 0) {
      const initial = roles.reduce(
        (
          acc: Record<string, { role: string; branch_id: string | null }>,
          role: any
        ) => {
          acc[role.id] = {
            role: role.role,
            branch_id: role.branch_id ?? null,
          };
          return acc;
        },
        {}
      );

      setRoleFormData(initial);
    } else {
      setRoleFormData({});
    }

    setIsRoleEditing(true);
  };

  const handleRoleChange = (roleId: string, newRole: string) => {
    setRoleFormData((prev) => {
      const previousBranch = prev[roleId]?.branch_id ?? null;
      return {
        ...prev,
        [roleId]: {
          role: newRole,
          branch_id: newRole === "consignment_owner" ? previousBranch : null,
        },
      };
    });
  };

  const handleBranchChange = (roleId: string, branchId: string | null) => {
    setRoleFormData((prev) => ({
      ...prev,
      [roleId]: {
        role: prev[roleId]?.role ?? "",
        branch_id: branchId,
      },
    }));
  };

  const handleSaveRoles = () => {
    if (!roles || roles.length === 0) return;

    const updates = roles.map((role: any) => {
      const formValue = roleFormData[role.id] ?? {
        role: role.role,
        branch_id: role.branch_id ?? null,
      };

      return {
        id: role.id,
        role: formValue.role,
        branch_id:
          formValue.role === "consignment_owner"
            ? formValue.branch_id ?? null
            : null,
      };
    });

    updateRolesMutation.mutate(updates);
  };

  const isRoleSaveDisabled =
    updateRolesMutation.isPending ||
    !roles ||
    roles.length === 0 ||
    roles.some((role: any) => {
      const formValue = roleFormData[role.id];

      if (!formValue || !formValue.role) {
        return true;
      }

      if (
        formValue.role === "consignment_owner" &&
        typeof formValue.branch_id === "undefined"
      ) {
        return true;
      }

      return false;
    });

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "แอดมิน";
      case "staff":
        return "พนักงาน";
      case "consignment_owner":
        return "เจ้าของร้านฝาก";
      default:
        return role;
    }
  };

  const consignmentBranches = branches.filter(
    (branch) => branch.type === "CONSIGNMENT"
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">โปรไฟล์ / Profile</h2>
          <p className="text-sm text-muted-foreground">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลส่วนตัว
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">ชื่อ-นามสกุล</Label>
                    <p className="text-lg font-medium">
                      {profile?.full_name || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">อีเมล</Label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile?.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">เบอร์โทรศัพท์</Label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profile?.phone || "-"}
                    </p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    แก้ไขข้อมูล
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                บทบาทและสิทธิ์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">บทบาทในระบบ</Label>
                  {!isRoleEditing ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {roles && roles.length > 0 ? (
                        roles.map((role: any) => (
                          <div key={role.id}>{getRoleBadge(role.role)}</div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">ไม่มีบทบาท</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-3">
                      {roles && roles.length > 0 ? (
                        roles.map((role: any, index: number) => {
                          const formValue =
                            roleFormData[role.id] ?? {
                              role: role.role,
                              branch_id: role.branch_id ?? null,
                            };
                          const defaultOptions = [
                            "admin",
                            "staff",
                            "consignment_owner",
                          ];
                          const selectOptions = Array.from(
                            new Set([...defaultOptions, formValue.role])
                          );

                          return (
                            <div key={role.id} className="space-y-2">
                              <Label className="text-sm text-muted-foreground">
                                บทบาทที่ {index + 1}
                              </Label>
                              <Select
                                value={formValue.role}
                                onValueChange={(value) =>
                                  handleRoleChange(role.id, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {getRoleLabel(option)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">ไม่มีบทบาท</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">สาขาที่รับผิดชอบ</Label>
                  {!isRoleEditing ? (
                    <div className="mt-2 space-y-2">
                      {roles && roles.length > 0 ? (
                        roles.map((role: any) => (
                          <div key={role.id} className="flex items-center gap-2">
                            <Badge variant="outline">
                              {role.branches?.name_th || "ทั้งหมด"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-3">
                      {roles && roles.length > 0 ? (
                        roles.map((role: any) => {
                          const formValue =
                            roleFormData[role.id] ?? {
                              role: role.role,
                              branch_id: role.branch_id ?? null,
                            };

                          if (formValue.role !== "consignment_owner") {
                            return (
                              <div key={role.id} className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">
                                  {getRoleLabel(formValue.role)}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  บทบาทนี้ไม่จำเป็นต้องเลือกสาขา
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div key={role.id} className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">
                                {getRoleLabel(formValue.role)}
                              </Label>
                              {consignmentBranches.length > 0 ? (
                                <Select
                                  value={formValue.branch_id ?? "__all__"}
                                  onValueChange={(value) =>
                                    handleBranchChange(
                                      role.id,
                                      value === "__all__" ? null : value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกสาขา" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__all__">ทั้งหมด</SelectItem>
                                    {consignmentBranches.map((branch) => (
                                      <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name_th}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  ไม่มีสาขาร้านฝากให้เลือก
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">วันที่สร้างบัญชี</Label>
                  <p className="text-sm mt-1">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                {isRoleEditing ? (
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsRoleEditing(false);
                        setRoleFormData({});
                      }}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={handleSaveRoles}
                      disabled={isRoleSaveDisabled}
                    >
                      {updateRolesMutation.isPending
                        ? "กำลังบันทึก..."
                        : "บันทึกบทบาท"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={startRoleEditing}
                    disabled={!roles || roles.length === 0}
                  >
                    แก้ไขบทบาท
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                ความปลอดภัย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">รหัสผ่าน</Label>
                  <p className="text-sm mt-1">••••••••</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsChangingPassword(true)}
                >
                  เปลี่ยนรหัสผ่าน
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>เปลี่ยนรหัสผ่าน</AlertDialogTitle>
            <AlertDialogDescription>
              กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPassword(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Profile;
