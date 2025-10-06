import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "กรุณากรอกรหัสสาขา")
    .max(50, "รหัสต้องไม่เกิน 50 ตัวอักษร")
    .regex(/^[A-Z0-9-]+$/, "รหัสต้องเป็นตัวพิมพ์ใหญ่และตัวเลขเท่านั้น"),
  type: z.enum(["MAIN", "BRANCH", "CONSIGNMENT"], {
    required_error: "กรุณาเลือกประเภทสาขา",
  }),
  name_th: z.string().trim().min(1, "กรุณากรอกชื่อภาษาไทย").max(255),
  name_en: z.string().trim().min(1, "กรุณากรอกชื่อภาษาอังกฤษ").max(255),
  address_th: z.string().trim().max(500).optional(),
  address_en: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(50).optional(),
  company_name_th: z.string().trim().max(255).optional(),
  company_name_en: z.string().trim().max(255).optional(),
  tax_id: z.string().trim().max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  initialData?: FormValues & { id?: string };
  isLoading?: boolean;
}

export const BranchDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: BranchDialogProps) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "BRANCH",
      name_th: "",
      name_en: "",
      address_th: "",
      address_en: "",
      phone: "",
      company_name_th: "",
      company_name_en: "",
      tax_id: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        code: "",
        type: "BRANCH",
        name_th: "",
        name_en: "",
        address_th: "",
        address_en: "",
        phone: "",
        company_name_th: "",
        company_name_en: "",
        tax_id: "",
      });
    }
  }, [initialData, form, open]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "แก้ไขสาขา" : "เพิ่มสาขาใหม่"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "แก้ไขข้อมูลสาขา" : "เพิ่มสาขาหรือร้านฝากขายใหม่"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสสาขา *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MAIN, BR01"
                        {...field}
                        disabled={!!initialData || submitting}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภท *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MAIN">สาขาหลัก</SelectItem>
                        <SelectItem value="BRANCH">สาขา</SelectItem>
                        <SelectItem value="CONSIGNMENT">ร้านฝาก</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name_th"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อภาษาไทย *</FormLabel>
                  <FormControl>
                    <Input placeholder="สาขา JW" {...field} disabled={submitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อภาษาอังกฤษ *</FormLabel>
                  <FormControl>
                    <Input placeholder="JW Branch" {...field} disabled={submitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_th"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ที่อยู่ภาษาไทย</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 ถนนสุขุมวิท..."
                      {...field}
                      disabled={submitting}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ที่อยู่ภาษาอังกฤษ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Sukhumvit Road..."
                      {...field}
                      disabled={submitting}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เบอร์โทร</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="02-123-4567"
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name_th"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อบริษัท (TH)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="บริษัท..."
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อบริษัท (EN)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company..."
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เลขผู้เสียภาษี</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0-0000-00000-00-0"
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "บันทึก" : "เพิ่ม"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
