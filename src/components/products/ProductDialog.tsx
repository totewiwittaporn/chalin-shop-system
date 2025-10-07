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
import { useProductTypes } from "@/hooks/useProductTypes";

const formSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "กรุณากรอก SKU")
    .max(100, "SKU ต้องไม่เกิน 100 ตัวอักษร")
    .regex(/^[A-Z0-9-]+$/, "SKU ต้องเป็นตัวพิมพ์ใหญ่และตัวเลขเท่านั้น"),
  barcode: z.string().trim().max(100).optional(),
  name_th: z.string().trim().min(1, "กรุณากรอกชื่อภาษาไทย").max(255),
  name_en: z.string().trim().min(1, "กรุณากรอกชื่อภาษาอังกฤษ").max(255),
  description: z.string().trim().max(1000).optional(),
  product_type_id: z.string().min(1, "กรุณาเลือกประเภทสินค้า"),
  base_price: z
    .string()
    .min(1, "กรุณากรอกราคา")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "ราคาต้องเป็นตัวเลขและไม่ติดลบ",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  initialData?: FormValues & { id?: string };
  isLoading?: boolean;
}

export const ProductDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ProductDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { productTypes, isLoading: typesLoading } = useProductTypes();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      barcode: "",
      name_th: "",
      name_en: "",
      description: "",
      product_type_id: "",
      base_price: "0",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        sku: "",
        barcode: "",
        name_th: "",
        name_en: "",
        description: "",
        product_type_id: "",
        base_price: "0",
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
            {initialData ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่เข้าสู่ระบบ"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="HP-001"
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
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890123"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภทสินค้า *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={submitting || typesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.code} - {type.name_th}
                          </SelectItem>
                        ))}
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
                  <FormLabel>ชื่อสินค้าภาษาไทย *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="กิ๊บติดผมเล็ก"
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
                  <FormLabel>ชื่อสินค้าภาษาอังกฤษ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Small Hair Clip"
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
              name="base_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาฐาน (฿) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
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
                  <FormLabel>คำอธิบาย</FormLabel>
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
