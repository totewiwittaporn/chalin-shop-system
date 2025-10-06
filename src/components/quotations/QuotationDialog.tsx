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
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const quotationItemSchema = z.object({
  product_id: z.string().uuid("กรุณาเลือกสินค้า"),
  quantity: z.number().min(1, "จำนวนต้องมากกว่า 0"),
  unit_price: z.number().min(0, "ราคาต้องไม่ติดลบ"),
});

const quotationSchema = z.object({
  branch_id: z.string().uuid("กรุณาเลือกสาขา"),
  customer_name: z.string().min(1, "กรุณาระบุชื่อลูกค้า").max(255),
  customer_email: z.string().email("อีเมลไม่ถูกต้อง").max(255).optional().or(z.literal("")),
  customer_phone: z.string().max(50).optional(),
  quotation_date: z.date(),
  valid_until: z.date(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(quotationItemSchema).min(1, "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ"),
});

type QuotationFormData = z.infer<typeof quotationSchema>;
type QuotationItem = z.infer<typeof quotationItemSchema>;

interface QuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuotationFormData) => Promise<any>;
  editingQuotation?: any;
}

export function QuotationDialog({ open, onOpenChange, onSubmit, editingQuotation }: QuotationDialogProps) {
  const { toast } = useToast();
  const { branches } = useBranches();
  const { products } = useProducts();
  
  const [formData, setFormData] = useState<QuotationFormData>({
    branch_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    quotation_date: new Date(),
    valid_until: addDays(new Date(), 7),
    discount: 0,
    tax: 0,
    notes: "",
    items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && editingQuotation) {
      setFormData({
        branch_id: editingQuotation.branch_id,
        customer_name: editingQuotation.customer_name,
        customer_email: editingQuotation.customer_email || "",
        customer_phone: editingQuotation.customer_phone || "",
        quotation_date: new Date(editingQuotation.quotation_date),
        valid_until: new Date(editingQuotation.valid_until),
        discount: parseFloat(editingQuotation.discount) || 0,
        tax: parseFloat(editingQuotation.tax) || 0,
        notes: editingQuotation.notes || "",
        items: editingQuotation.quotation_items?.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
        })) || [],
      });
    } else if (open && !editingQuotation) {
      setFormData({
        branch_id: "",
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        quotation_date: new Date(),
        valid_until: addDays(new Date(), 7),
        discount: 0,
        tax: 0,
        notes: "",
        items: [],
      });
    }
    setErrors({});
  }, [open, editingQuotation]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
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
      const validated = quotationSchema.parse(formData);
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

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    return subtotal - discount + tax;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuotation ? "แก้ไขใบเสนอราคา" : "สร้างใบเสนอราคาใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch_id">สาขา *</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
                disabled={!!editingQuotation}
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
              <Label htmlFor="customer_name">ชื่อลูกค้า *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="ชื่อลูกค้า"
              />
              {errors.customer_name && <p className="text-sm text-destructive">{errors.customer_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_email">อีเมล</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="customer@example.com"
              />
              {errors.customer_email && <p className="text-sm text-destructive">{errors.customer_email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">เบอร์โทร</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="0812345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quotation_date">วันที่เสนอราคา *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.quotation_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.quotation_date ? format(formData.quotation_date, "dd/MM/yyyy") : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.quotation_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, quotation_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">ใช้ได้ถึง *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.valid_until && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.valid_until ? format(formData.valid_until, "dd/MM/yyyy") : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.valid_until}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, valid_until: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
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
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>รวม</Label>
                      <Input
                        value={(item.quantity * item.unit_price).toFixed(2)}
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">ส่วนลด (฿)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">ภาษี (฿)</Label>
              <Input
                id="tax"
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
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

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ยอดรวม</span>
              <span>฿{calculateSubtotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ส่วนลด</span>
              <span className="text-destructive">-฿{(formData.discount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ภาษี</span>
              <span>+฿{(formData.tax || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>ยอดสุทธิ</span>
              <span>฿{calculateTotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : editingQuotation ? "บันทึกการแก้ไข" : "สร้างใบเสนอราคา"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
