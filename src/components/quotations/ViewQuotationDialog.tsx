import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface ViewQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: any;
}

export const ViewQuotationDialog = ({ open, onOpenChange, quotation }: ViewQuotationDialogProps) => {
  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">รายละเอียดใบเสนอราคา</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">เลขที่เอกสาร</p>
              <p className="font-mono font-semibold">{quotation.doc_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">สถานะ</p>
              <Badge variant="default">{quotation.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่</p>
              <p>{format(new Date(quotation.quotation_date), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ใช้ได้ถึง</p>
              <p>{format(new Date(quotation.valid_until), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">สาขา</p>
              <p>{quotation.branches?.name_th}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3">ข้อมูลลูกค้า</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ชื่อลูกค้า</p>
                <p>{quotation.customer_name}</p>
              </div>
              {quotation.customer_email && (
                <div>
                  <p className="text-sm text-muted-foreground">อีเมล</p>
                  <p>{quotation.customer_email}</p>
                </div>
              )}
              {quotation.customer_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">โทรศัพท์</p>
                  <p>{quotation.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">รายการสินค้า</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">สินค้า</th>
                    <th className="px-4 py-2 text-right text-sm">จำนวน</th>
                    <th className="px-4 py-2 text-right text-sm">ราคา/หน่วย</th>
                    <th className="px-4 py-2 text-right text-sm">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.quotation_items?.map((item: any, index: number) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-4 py-2 text-sm">{item.products?.name_th}</td>
                      <td className="px-4 py-2 text-right text-sm">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-sm">
                        ฿{item.unit_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold">
                        ฿{item.total_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ยอดรวม</span>
              <span className="font-semibold">
                ฿{quotation.subtotal?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span className="text-sm">ส่วนลด</span>
                <span>-฿{quotation.discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">ภาษี</span>
                <span>฿{quotation.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>฿{quotation.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {quotation.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">หมายเหตุ</p>
              <p className="text-sm">{quotation.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
