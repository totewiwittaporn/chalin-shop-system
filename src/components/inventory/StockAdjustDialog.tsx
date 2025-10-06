import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";

const formSchema = z.object({
  branch_id: z.string().min(1, "กรุณาเลือกสาขา"),
  product_id: z.string().min(1, "กรุณาเลือกสินค้า"),
  adjustment_type: z.enum(["add", "subtract", "set"], {
    required_error: "กรุณาเลือกประเภทการปรับ",
  }),
  quantity: z
    .string()
    .min(1, "กรุณากรอกจำนวน")
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "จำนวนต้องมากกว่า 0",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    branch_id: string;
    product_id: string;
    adjustment_type: "add" | "subtract" | "set";
    quantity: number;
  }) => Promise<void>;
}

export const StockAdjustDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: StockAdjustDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { branches } = useBranches();
  const { products } = useProducts();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch_id: "",
      product_id: "",
      adjustment_type: "add",
      quantity: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      await onSubmit({
        branch_id: data.branch_id,
        product_id: data.product_id,
        adjustment_type: data.adjustment_type,
        quantity: parseInt(data.quantity),
      });
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
          <DialogTitle>ปรับสต็อกสินค้า</DialogTitle>
          <DialogDescription>
            เพิ่ม ลด หรือกำหนดจำนวนสต็อกสินค้า
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="branch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สาขา *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขา" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.code} - {branch.name_th}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สินค้า *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสินค้า" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.sku} - {product.name_th}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adjustment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภทการปรับ *</FormLabel>
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
                      <SelectItem value="add">เพิ่มสต็อก (+)</SelectItem>
                      <SelectItem value="subtract">ลดสต็อก (-)</SelectItem>
                      <SelectItem value="set">กำหนดจำนวน (=)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวน *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="0"
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
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
