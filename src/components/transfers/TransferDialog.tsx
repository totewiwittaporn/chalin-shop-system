import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const transferItemSchema = z.object({
  product_id: z.string().uuid("กรุณาเลือกสินค้า"),
  quantity: z.number().min(1, "จำนวนต้องมากกว่า 0"),
});

const transferSchema = z.object({
  from_branch_id: z.string().uuid("กรุณาเลือกสาขาต้นทาง"),
  to_branch_id: z.string().uuid("กรุณาเลือกสาขาปลายทาง"),
  transfer_date: z.date(),
  notes: z.string().max(1000).optional(),
  items: z.array(transferItemSchema).min(1, "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ"),
}).refine((data) => data.from_branch_id !== data.to_branch_id, {
  message: "สาขาต้นทางและปลายทางต้องไม่เหมือนกัน",
  path: ["to_branch_id"],
});

type TransferFormData = z.infer<typeof transferSchema>;
type TransferItem = z.infer<typeof transferItemSchema>;

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransferFormData) => Promise<any>;
}

export function TransferDialog({ open, onOpenChange, onSubmit }: TransferDialogProps) {
  const { toast } = useToast();
  const { branches } = useBranches();
  const { products } = useProducts();
  
  const [formData, setFormData] = useState<TransferFormData>({
    from_branch_id: "",
    to_branch_id: "",
    transfer_date: new Date(),
    notes: "",
    items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        from_branch_id: "",
        to_branch_id: "",
        transfer_date: new Date(),
        notes: "",
        items: [],
      });
      setErrors({});
    }
  }, [open]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof TransferItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validated = transferSchema.parse(formData);
      await onSubmit(validated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        toast({
          title: "ข้อมูลไม่ถูกต้อง",
          description: "กรุณาตรวจสอบข้อมูลที่กรอก",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างใบโอนสินค้าใหม่</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              การโอนสินค้าจะต้องได้รับการอนุมัติก่อนจึงจะหักสต็อกจากสาขาต้นทาง และต้องรับสินค้าที่สาขาปลายทางเพื่ออัปเดตสต็อก
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_branch_id">สาขาต้นทาง *</Label>
              <Select
                value={formData.from_branch_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, from_branch_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขาต้นทาง" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name_th} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.from_branch_id && <p className="text-sm text-destructive">{errors.from_branch_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_branch_id">สาขาปลายทาง *</Label>
              <Select
                value={formData.to_branch_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, to_branch_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขาปลายทาง" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.filter(b => b.id !== formData.from_branch_id).map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name_th} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.to_branch_id && <p className="text-sm text-destructive">{errors.to_branch_id}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer_date">วันที่โอน *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.transfer_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.transfer_date ? format(formData.transfer_date, "dd/MM/yyyy") : "เลือกวันที่"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.transfer_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, transfer_date: date }))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>รายการสินค้า *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                เพิ่มสินค้า
              </Button>
            </div>

            {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-9">
                      <Label>สินค้า</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateItem(index, "product_id", value)}
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
                      {errors[`items.${index}.product_id`] && (
                        <p className="text-sm text-destructive">{errors[`items.${index}.product_id`]}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label>จำนวน</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "สร้างใบโอน"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
