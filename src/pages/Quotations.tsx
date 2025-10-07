import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Plus, Eye, Send, CheckCircle, XCircle, Search, Edit } from "lucide-react";
import { QuotationDialog } from "@/components/quotations/QuotationDialog";
import { ViewQuotationDialog } from "@/components/quotations/ViewQuotationDialog";
import { useQuotations } from "@/hooks/useQuotations";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter } from "date-fns";

const Quotations = () => {
  const { quotations, isLoading, createQuotation, updateQuotation, sendQuotation, acceptQuotation, rejectQuotation } = useQuotations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [viewingQuotation, setViewingQuotation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filteredQuotations = quotations?.filter((quotation) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      quotation.doc_no.toLowerCase().includes(searchLower) ||
      quotation.customer_name.toLowerCase().includes(searchLower) ||
      quotation.branches?.name_th.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string, validUntil: string) => {
    // Check if expired
    const isExpired = isAfter(new Date(), new Date(validUntil));
    if (isExpired && status !== "ACCEPTED" && status !== "REJECTED") {
      return <Badge variant="outline" className="text-muted-foreground">หมดอายุ</Badge>;
    }

    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">ฉบับร่าง</Badge>;
      case "SENT":
        return <Badge variant="secondary">ส่งแล้ว</Badge>;
      case "ACCEPTED":
        return <Badge variant="default">ตอบรับแล้ว</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = (quotation: any) => {
    setEditingQuotation(quotation);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingQuotation) {
      await updateQuotation({ id: editingQuotation.id, input: data });
    } else {
      await createQuotation(data);
    }
  };

  const handleSend = async (id: string) => {
    await sendQuotation(id);
    setSendingId(null);
  };

  const handleAccept = async (id: string) => {
    await acceptQuotation(id);
    setAcceptingId(null);
  };

  const handleReject = async (id: string) => {
    await rejectQuotation(id);
    setRejectingId(null);
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ใบเสนอราคา / Quotations</h2>
            <p className="text-sm text-muted-foreground">สร้างและจัดการใบเสนอราคา</p>
          </div>
          <Button className="gap-2" onClick={() => { setEditingQuotation(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            สร้างใบเสนอราคาใหม่
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                รายการใบเสนอราคา
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาเลขที่เอกสาร, ลูกค้า..."
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
            ) : filteredQuotations && filteredQuotations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">วันที่</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ลูกค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">รายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">มูลค่า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ใช้ได้ถึง</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.map((quotation) => (
                      <tr key={quotation.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{quotation.doc_no}</td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(quotation.quotation_date), "dd/MM/yyyy")}
                        </td>
                        <td className="px-4 py-3 font-medium">{quotation.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {quotation.quotation_items?.length || 0} รายการ
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          ฿{quotation.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(quotation.valid_until), "dd/MM/yyyy")}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(quotation.status, quotation.valid_until)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {quotation.status === "DRAFT" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(quotation)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSendingId(quotation.id)}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  ส่ง
                                </Button>
                              </>
                            )}
                            {quotation.status === "SENT" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAcceptingId(quotation.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  ยอมรับ
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRejectingId(quotation.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  ปฏิเสธ
                                </Button>
                              </>
                            )}
                            {quotation.status === "ACCEPTED" && (
                              <Button variant="outline" size="sm">
                                แปลงเป็นใบขาย
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setViewingQuotation(quotation)}
                              title="ดูรายละเอียด"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ไม่พบข้อมูลใบเสนอราคา</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QuotationDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingQuotation(null);
        }}
        onSubmit={handleSubmit}
        editingQuotation={editingQuotation}
      />

      <ViewQuotationDialog
        open={!!viewingQuotation}
        onOpenChange={(open) => !open && setViewingQuotation(null)}
        quotation={viewingQuotation}
      />

      <AlertDialog open={!!sendingId} onOpenChange={() => setSendingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการส่งใบเสนอราคา</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการส่งใบเสนอราคานี้ให้ลูกค้าหรือไม่? หลังจากส่งแล้วจะไม่สามารถแก้ไขได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => sendingId && handleSend(sendingId)}>
              ยืนยันส่ง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!acceptingId} onOpenChange={() => setAcceptingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยอมรับ</AlertDialogTitle>
            <AlertDialogDescription>
              ลูกค้ายอมรับใบเสนอราคานี้หรือไม่? หลังจากยอมรับแล้วสามารถแปลงเป็นใบขายได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => acceptingId && handleAccept(acceptingId)}>
              ยืนยันยอมรับ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการปฏิเสธ</AlertDialogTitle>
            <AlertDialogDescription>
              ลูกค้าปฏิเสธใบเสนอราคานี้หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => rejectingId && handleReject(rejectingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ยืนยันปฏิเสธ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Quotations;
