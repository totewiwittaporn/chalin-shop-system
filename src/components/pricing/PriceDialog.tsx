import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const priceSchema = z.object({
  price: z.number().min(0, "ราคาต้องไม่ติดลบ"),
  effective_from: z.date(),
  effective_to: z.date().optional(),
});

type PriceFormData = z.infer<typeof priceSchema>;

interface PriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  type: "standard-product" | "standard-type" | "shop-product" | "shop-type";
  products?: any[];
  productTypes?: any[];
  branches?: any[];
}

export function PriceDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  title, 
  type,
  products,
  productTypes,
  branches 
}: PriceDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<any>({
    price: 0,
    effective_from: new Date(),
    effective_to: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        price: 0,
        effective_from: new Date(),
        effective_to: undefined,
      });
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validated = priceSchema.parse({
        price: formData.price,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to,
      });

      const submitData: any = { ...validated };

      if (type === "standard-product" || type === "shop-product") {
        if (!formData.product_id) {
          throw new Error("กรุณาเลือกสินค้า");
        }
        submitData.product_id = formData.product_id;
      }

      if (type === "standard-type" || type === "shop-type") {
        if (!formData.product_type_id) {
          throw new Error("กรุณาเลือกประเภทสินค้า");
        }
        submitData.product_type_id = formData.product_type_id;
      }

      if (type === "shop-product" || type === "shop-type") {
        if (!formData.branch_id) {
          throw new Error("กรุณาเลือกสาขา");
        }
        submitData.branch_id = formData.branch_id;
      }

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(type === "shop-product" || type === "shop-type") && (
            <div className="space-y-2">
              <Label htmlFor="branch_id">สาขา *</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, branch_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name_th} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === "standard-product" || type === "shop-product") && (
            <div className="space-y-2">
              <Label htmlFor="product_id">สินค้า *</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, product_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name_th} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === "standard-type" || type === "shop-type") && (
            <div className="space-y-2">
              <Label htmlFor="product_type_id">ประเภทสินค้า *</Label>
              <Select
                value={formData.product_type_id}
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, product_type_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name_th} ({type.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="price">ราคา (฿) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              min="0"
              step="0.01"
            />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label>ใช้ได้ตั้งแต่ *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.effective_from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.effective_from ? format(formData.effective_from, "dd/MM/yyyy") : "เลือกวันที่"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.effective_from}
                  onSelect={(date) => date && setFormData((prev: any) => ({ ...prev, effective_from: date }))}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>ใช้ได้ถึง (ไม่บังคับ)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.effective_to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.effective_to ? format(formData.effective_to, "dd/MM/yyyy") : "ไม่จำกัด"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.effective_to}
                  onSelect={(date) => setFormData((prev: any) => ({ ...prev, effective_to: date }))}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
