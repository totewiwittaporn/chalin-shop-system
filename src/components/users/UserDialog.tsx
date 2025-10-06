import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUser } from "@/hooks/useUsers";
import { useBranches } from "@/hooks/useBranches";

const userSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff", "consignment_owner"]),
  branch_id: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ open, onOpenChange }: UserDialogProps) {
  const createUserMutation = useCreateUser();
  const { branches } = useBranches();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: UserFormData) => {
    await createUserMutation.mutateAsync({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
      branch_id: data.branch_id,
    });
    reset();
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มผู้ใช้งาน</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน *</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
            <Input id="full_name" {...register("full_name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">บทบาท *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{getRoleLabel("admin")}</SelectItem>
                <SelectItem value="staff">{getRoleLabel("staff")}</SelectItem>
                <SelectItem value="consignment_owner">
                  {getRoleLabel("consignment_owner")}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {selectedRole === "consignment_owner" && (
            <div className="space-y-2">
              <Label htmlFor="branch_id">สาขา *</Label>
              <Select
                value={watch("branch_id")}
                onValueChange={(value) => setValue("branch_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    ?.filter((b) => b.type === "CONSIGNMENT")
                    .map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name_th}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
