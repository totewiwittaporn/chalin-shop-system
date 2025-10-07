import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface ViewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: any;
}

export const ViewSaleDialog = ({ open, onOpenChange, sale }: ViewSaleDialogProps) => {
  if (!sale) return null;

  const totalCost = sale.sale_items?.reduce((sum: number, item: any) => sum + item.total_cost, 0) || 0;
  const totalProfit = sale.total_amount - totalCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">รายละเอียดการขาย</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">เลขที่เอกสาร</p>
              <p className="font-mono font-semibold">{sale.doc_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">สถานะ</p>
              <Badge variant={sale.status === "COMPLETED" ? "default" : "destructive"}>
                {sale.status === "COMPLETED" ? "สำเร็จ" : "ยกเลิก"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่ขาย</p>
              <p>{format(new Date(sale.sale_date), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">สาขา</p>
              <p>{sale.branches?.name_th}</p>
            </div>
            {sale.customer_name && (
              <div>
                <p className="text-sm text-muted-foreground">ชื่อลูกค้า</p>
                <p>{sale.customer_name}</p>
              </div>
            )}
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
                    <th className="px-4 py-2 text-right text-sm">ต้นทุน/หน่วย</th>
                    <th className="px-4 py-2 text-right text-sm">รวม</th>
                    <th className="px-4 py-2 text-right text-sm">กำไร</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.sale_items?.map((item: any, index: number) => {
                    const itemProfit = item.total_price - item.total_cost;
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="px-4 py-2 text-sm">{item.products?.name_th}</td>
                        <td className="px-4 py-2 text-right text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-sm">
                          ฿{item.unit_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-muted-foreground">
                          ฿{item.unit_cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-semibold">
                          ฿{item.total_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">
                          ฿{itemProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ยอดรวม</span>
              <span className="font-semibold">
                ฿{sale.subtotal?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span className="text-sm">ส่วนลด</span>
                <span>-฿{sale.discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">ภาษี</span>
                <span>฿{sale.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>฿{sale.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-green-600 font-bold">
              <span>กำไรรวม</span>
              <span>฿{totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {sale.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">หมายเหตุ</p>
              <p className="text-sm">{sale.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
