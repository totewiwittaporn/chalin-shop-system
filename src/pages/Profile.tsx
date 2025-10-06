import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  const { data: roles } = useUserRole();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {roles && roles.length > 0 ? (
                      roles.map((role: any) => (
                        <div key={role.id}>{getRoleBadge(role.role)}</div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">ไม่มีบทบาท</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">สาขาที่รับผิดชอบ</Label>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
