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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "กรุณากรอกรหัสประเภท")
    .max(50, "รหัสต้องไม่เกิน 50 ตัวอักษร")
    .regex(/^[A-Z0-9-]+$/, "รหัสต้องเป็นตัวพิมพ์ใหญ่และตัวเลขเท่านั้น"),
  name_th: z.string().trim().min(1, "กรุณากรอกชื่อภาษาไทย").max(255, "ชื่อต้องไม่เกิน 255 ตัวอักษร"),
  name_en: z.string().trim().min(1, "กรุณากรอกชื่อภาษาอังกฤษ").max(255, "ชื่อต้องไม่เกิน 255 ตัวอักษร"),
  description: z.string().trim().max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  initialData?: FormValues & { id?: string };
  isLoading?: boolean;
}

export const ProductTypeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ProductTypeDialogProps) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name_th: "",
      name_en: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name_th: initialData.name_th,
        name_en: initialData.name_en,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        code: "",
        name_th: "",
        name_en: "",
        description: "",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "แก้ไขประเภทสินค้า" : "เพิ่มประเภทสินค้าใหม่"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "แก้ไขข้อมูลประเภทสินค้า"
              : "เพิ่มประเภทสินค้าใหม่เข้าสู่ระบบ"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสประเภท (Code) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="เช่น HP, ER, BR"
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
              name="name_th"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อภาษาไทย (Thai Name) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="กิ๊บติดผม"
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
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อภาษาอังกฤษ (English Name) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hair Clips"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย (Description)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="รายละเอียดเพิ่มเติม..."
                      {...field}
                      disabled={submitting}
                      rows={3}
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
