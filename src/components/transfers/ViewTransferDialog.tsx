import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface ViewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: any;
}

export const ViewTransferDialog = ({ open, onOpenChange, transfer }: ViewTransferDialogProps) => {
  if (!transfer) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case "RECEIVED": return "สำเร็จ";
      case "IN_TRANSIT": return "อนุมัติแล้ว";
      case "PENDING": return "รออนุมัติ";
      case "CANCELLED": return "ยกเลิก";
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">รายละเอียดการโอนสินค้า</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">เลขที่เอกสาร</p>
              <p className="font-mono font-semibold">{transfer.doc_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">สถานะ</p>
              <Badge variant="default">{getStatusText(transfer.status)}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่โอน</p>
              <p>{format(new Date(transfer.transfer_date), "dd/MM/yyyy")}</p>
            </div>
            {transfer.approved_at && (
              <div>
                <p className="text-sm text-muted-foreground">อนุมัติเมื่อ</p>
                <p>{format(new Date(transfer.approved_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
            )}
            {transfer.received_at && (
              <div>
                <p className="text-sm text-muted-foreground">รับเมื่อ</p>
                <p>{format(new Date(transfer.received_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Branch Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">จากสาขา</p>
              <div className="p-3 border rounded-lg">
                <p className="font-semibold">{transfer.from_branch?.name_th}</p>
                <p className="text-sm text-muted-foreground">{transfer.from_branch?.code}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">ไปยังสาขา</p>
              <div className="p-3 border rounded-lg">
                <p className="font-semibold">{transfer.to_branch?.name_th}</p>
                <p className="text-sm text-muted-foreground">{transfer.to_branch?.code}</p>
              </div>
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
                    <th className="px-4 py-2 text-left text-sm">SKU</th>
                    <th className="px-4 py-2 text-left text-sm">สินค้า</th>
                    <th className="px-4 py-2 text-right text-sm">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.transfer_items?.map((item: any, index: number) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-4 py-2 text-sm font-mono">{item.products?.sku}</td>
                      <td className="px-4 py-2 text-sm">{item.products?.name_th}</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transfer.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">หมายเหตุ</p>
                <p className="text-sm">{transfer.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
