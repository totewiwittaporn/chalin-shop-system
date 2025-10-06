import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const purchaseItemSchema = z.object({
  product_id: z.string().uuid("กรุณาเลือกสินค้า"),
  quantity: z.number().min(1, "จำนวนต้องมากกว่า 0"),
  unit_cost: z.number().min(0, "ราคาต้นทุนต้องไม่ติดลบ"),
});

const purchaseSchema = z.object({
  branch_id: z.string().uuid("กรุณาเลือกสาขา"),
  supplier_name: z.string().min(1, "กรุณาระบุชื่อผู้จำหน่าย").max(255),
  purchase_date: z.date(),
  notes: z.string().max(1000).optional(),
  items: z.array(purchaseItemSchema).min(1, "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ"),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;
type PurchaseItem = z.infer<typeof purchaseItemSchema>;

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PurchaseFormData) => Promise<any>;
  editingPurchase?: any;
}

export function PurchaseDialog({ open, onOpenChange, onSubmit, editingPurchase }: PurchaseDialogProps) {
  const { toast } = useToast();
  const { branches } = useBranches();
  const { products } = useProducts();
  
  const [formData, setFormData] = useState<PurchaseFormData>({
    branch_id: "",
    supplier_name: "",
    purchase_date: new Date(),
    notes: "",
    items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && editingPurchase) {
      setFormData({
        branch_id: editingPurchase.branch_id,
        supplier_name: editingPurchase.supplier_name,
        purchase_date: new Date(editingPurchase.purchase_date),
        notes: editingPurchase.notes || "",
        items: editingPurchase.purchase_items?.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: parseFloat(item.unit_cost),
        })) || [],
      });
    } else if (open && !editingPurchase) {
      setFormData({
        branch_id: "",
        supplier_name: "",
        purchase_date: new Date(),
        notes: "",
        items: [],
      });
    }
    setErrors({});
  }, [open, editingPurchase]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_cost: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
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
      const validated = purchaseSchema.parse(formData);
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

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPurchase ? "แก้ไขใบสั่งซื้อ" : "สร้างใบสั่งซื้อใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch_id">สาขา *</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
                disabled={!!editingPurchase}
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
              {errors.branch_id && <p className="text-sm text-destructive">{errors.branch_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">วันที่สั่งซื้อ *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.purchase_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.purchase_date ? format(formData.purchase_date, "dd/MM/yyyy") : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.purchase_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, purchase_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_name">ผู้จำหน่าย *</Label>
            <Input
              id="supplier_name"
              value={formData.supplier_name}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
              placeholder="ชื่อผู้จำหน่าย"
            />
            {errors.supplier_name && <p className="text-sm text-destructive">{errors.supplier_name}</p>}
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
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
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

                    <div className="col-span-2">
                      <Label>ราคา/หน่วย</Label>
                      <Input
                        type="number"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, "unit_cost", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>รวม</Label>
                      <Input
                        value={(item.quantity * item.unit_cost).toFixed(2)}
                        disabled
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

            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ยอดรวมทั้งหมด</p>
                <p className="text-2xl font-bold">฿{calculateTotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : editingPurchase ? "บันทึกการแก้ไข" : "สร้างใบสั่งซื้อ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
