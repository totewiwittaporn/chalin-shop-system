import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeftRight, Plus, FileText, Search, CheckCircle, Package } from "lucide-react";
import { TransferDialog } from "@/components/transfers/TransferDialog";
import { ViewTransferDialog } from "@/components/transfers/ViewTransferDialog";
import { useTransfers } from "@/hooks/useTransfers";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Transfers = () => {
  const { transfers, isLoading, createTransfer, approveTransfer, receiveTransfer, cancelTransfer } = useTransfers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredTransfers = transfers?.filter((transfer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transfer.doc_no.toLowerCase().includes(searchLower) ||
      transfer.from_branch?.name_th.toLowerCase().includes(searchLower) ||
      transfer.to_branch?.name_th.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <Badge variant="default">สำเร็จ</Badge>;
      case "IN_TRANSIT":
        return <Badge variant="secondary">อนุมัติแล้ว</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">รออนุมัติ</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = async (id: string) => {
    await approveTransfer(id);
    setApprovingId(null);
  };

  const handleReceive = async (id: string) => {
    await receiveTransfer(id);
    setReceivingId(null);
  };

  const handleCancel = async (id: string) => {
    await cancelTransfer(id);
    setCancellingId(null);
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">โอนสินค้า / Transfers</h2>
            <p className="text-sm text-muted-foreground">โอนสินค้าระหว่างสาขา</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            สร้างใบโอนสินค้า
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                รายการโอนสินค้า
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาเลขที่เอกสาร, สาขา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredTransfers && filteredTransfers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">จาก</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ไปยัง</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">รายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{transfer.doc_no}</td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(transfer.transfer_date), "dd/MM/yyyy")}
                        </td>
                        <td className="px-4 py-3">{transfer.from_branch?.name_th}</td>
                        <td className="px-4 py-3">{transfer.to_branch?.name_th}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {transfer.transfer_items?.length || 0} รายการ
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(transfer.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setViewingTransfer(transfer)}
                              title="ดูรายละเอียด"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            {transfer.status === "PENDING" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setApprovingId(transfer.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  อนุมัติ
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCancellingId(transfer.id)}
                                >
                                  ยกเลิก
                                </Button>
                              </>
                            )}
                            {transfer.status === "IN_TRANSIT" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReceivingId(transfer.id)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                รับสินค้า
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ไม่พบข้อมูลการโอนสินค้า</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={createTransfer}
      />

      <ViewTransferDialog
        open={!!viewingTransfer}
        onOpenChange={(open) => !open && setViewingTransfer(null)}
        transfer={viewingTransfer}
      />

      <AlertDialog open={!!approvingId} onOpenChange={() => setApprovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการอนุมัติ</AlertDialogTitle>
            <AlertDialogDescription>
              การอนุมัติจะหักสต็อกจากสาขาต้นทางทันที ต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => approvingId && handleApprove(approvingId)}>
              ยืนยันอนุมัติ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!receivingId} onOpenChange={() => setReceivingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการรับสินค้า</AlertDialogTitle>
            <AlertDialogDescription>
              การรับสินค้าจะอัปเดตสต็อกที่สาขาปลายทางและย้าย Stock Lots ต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => receivingId && handleReceive(receivingId)}>
              ยืนยันรับสินค้า
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิก</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการยกเลิกการโอนนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => cancellingId && handleCancel(cancellingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ยืนยันยกเลิก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Transfers;
