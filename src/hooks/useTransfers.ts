import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TransferItem {
  id: string;
  product_id: string;
  quantity: number;
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
  };
}

export interface Transfer {
  id: string;
  doc_no: string;
  from_branch_id: string;
  to_branch_id: string;
  transfer_date: string;
  status: "PENDING" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";
  notes?: string;
  approved_at?: string;
  received_at?: string;
  created_at: string;
  from_branch?: {
    name_th: string;
    name_en: string;
    code: string;
  };
  to_branch?: {
    name_th: string;
    name_en: string;
    code: string;
  };
  transfer_items?: TransferItem[];
}

export interface TransferInput {
  from_branch_id: string;
  to_branch_id: string;
  transfer_date: Date;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export function useTransfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select(`
          *,
          from_branch:branches!transfers_from_branch_id_fkey (name_th, name_en, code),
          to_branch:branches!transfers_to_branch_id_fkey (name_th, name_en, code),
          transfer_items (
            *,
            products (sku, name_th, name_en)
          )
        `)
        .order("transfer_date", { ascending: false });

      if (error) throw error;
      return data as Transfer[];
    },
  });

  const createTransferMutation = useMutation({
    mutationFn: async (input: TransferInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate doc_no
      const { data: fromBranch } = await supabase
        .from("branches")
        .select("code")
        .eq("id", input.from_branch_id)
        .single();

      const { data: toBranch } = await supabase
        .from("branches")
        .select("code")
        .eq("id", input.to_branch_id)
        .single();

      const dateStr = input.transfer_date.toISOString().slice(0, 7).replace("-", "");
      const { data: lastTransfer } = await supabase
        .from("transfers")
        .select("doc_no")
        .like("doc_no", `TR-${fromBranch?.code}-${toBranch?.code}-${dateStr}-%`)
        .order("doc_no", { ascending: false })
        .limit(1)
        .single();

      let runningNo = 1;
      if (lastTransfer) {
        const match = lastTransfer.doc_no.match(/-(\d+)$/);
        if (match) runningNo = parseInt(match[1]) + 1;
      }

      const doc_no = `TR-${fromBranch?.code}-${toBranch?.code}-${dateStr}-${String(runningNo).padStart(3, "0")}`;

      // Insert transfer
      const { data: transfer, error: transferError } = await supabase
        .from("transfers")
        .insert({
          doc_no,
          from_branch_id: input.from_branch_id,
          to_branch_id: input.to_branch_id,
          transfer_date: input.transfer_date.toISOString().split("T")[0],
          notes: input.notes,
          status: "PENDING",
          created_by: user.id,
        })
        .select()
        .single();

      if (transferError) throw transferError;

      // Insert items
      const items = input.items.map(item => ({
        transfer_id: transfer.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("transfer_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast({
        title: "สร้างใบโอนสำเร็จ",
        description: "รอการอนุมัติจากผู้มีอำนาจ",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveTransferMutation = useMutation({
    mutationFn: async (transferId: string) => {
      // Get transfer with items
      const { data: transfer, error: fetchError } = await supabase
        .from("transfers")
        .select(`
          *,
          transfer_items (*)
        `)
        .eq("id", transferId)
        .single();

      if (fetchError) throw fetchError;

      // Check stock availability
      for (const item of transfer.transfer_items) {
        const { data: branchProduct } = await supabase
          .from("branch_products")
          .select("quantity")
          .eq("branch_id", transfer.from_branch_id)
          .eq("product_id", item.product_id)
          .single();

        if (!branchProduct || branchProduct.quantity < item.quantity) {
          throw new Error(`สต็อกไม่เพียงพอสำหรับสินค้า ${item.product_id}`);
        }
      }

      // Update transfer status to IN_TRANSIT (approved and ready to transfer)
      const { error: updateError } = await supabase
        .from("transfers")
        .update({
          status: "IN_TRANSIT",
          approved_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (updateError) throw updateError;

      // Deduct stock from source branch
      for (const item of transfer.transfer_items) {
        const { data: branchProduct } = await supabase
          .from("branch_products")
          .select("*")
          .eq("branch_id", transfer.from_branch_id)
          .eq("product_id", item.product_id)
          .single();

        if (branchProduct) {
          await supabase
            .from("branch_products")
            .update({ quantity: branchProduct.quantity - item.quantity })
            .eq("id", branchProduct.id);
        }
      }

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "อนุมัติการโอนสำเร็จ",
        description: "หักสต็อกจากสาขาต้นทางเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const receiveTransferMutation = useMutation({
    mutationFn: async (transferId: string) => {
      // Get transfer with items
      const { data: transfer, error: fetchError } = await supabase
        .from("transfers")
        .select(`
          *,
          transfer_items (*)
        `)
        .eq("id", transferId)
        .single();

      if (fetchError) throw fetchError;

      if (transfer.status !== "IN_TRANSIT") {
        throw new Error("ต้องได้รับการอนุมัติก่อนจึงจะรับสินค้าได้");
      }

      // Update transfer status
      const { error: updateError } = await supabase
        .from("transfers")
        .update({
          status: "RECEIVED",
          received_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (updateError) throw updateError;

      // Add stock to destination branch and transfer stock lots
      for (const item of transfer.transfer_items) {
        // Get stock lots from source branch (FIFO)
        const { data: sourceLots } = await supabase
          .from("stock_lots")
          .select("*")
          .eq("branch_id", transfer.from_branch_id)
          .eq("product_id", item.product_id)
          .gt("remaining_quantity", 0)
          .order("lot_date", { ascending: true });

        if (!sourceLots || sourceLots.length === 0) continue;

        let remainingQty = item.quantity;
        for (const lot of sourceLots) {
          if (remainingQty <= 0) break;

          const qtyToTransfer = Math.min(remainingQty, lot.remaining_quantity);

          // Create new lot in destination branch
          await supabase
            .from("stock_lots")
            .insert({
              branch_id: transfer.to_branch_id,
              product_id: item.product_id,
              quantity: qtyToTransfer,
              remaining_quantity: qtyToTransfer,
              unit_cost: lot.unit_cost,
              reference_doc_type: "TRANSFER",
              reference_doc_id: transferId,
            });

          // Update source lot
          await supabase
            .from("stock_lots")
            .update({ remaining_quantity: lot.remaining_quantity - qtyToTransfer })
            .eq("id", lot.id);

          remainingQty -= qtyToTransfer;
        }

        // Update destination branch_products
        const { data: destProduct } = await supabase
          .from("branch_products")
          .select("*")
          .eq("branch_id", transfer.to_branch_id)
          .eq("product_id", item.product_id)
          .single();

        if (destProduct) {
          await supabase
            .from("branch_products")
            .update({ quantity: destProduct.quantity + item.quantity })
            .eq("id", destProduct.id);
        } else {
          await supabase
            .from("branch_products")
            .insert({
              branch_id: transfer.to_branch_id,
              product_id: item.product_id,
              quantity: item.quantity,
              min_stock: 0,
            });
        }
      }

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-lots"] });
      toast({
        title: "รับสินค้าสำเร็จ",
        description: "อัปเดตสต็อกที่สาขาปลายทางเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelTransferMutation = useMutation({
    mutationFn: async (transferId: string) => {
      const { error } = await supabase
        .from("transfers")
        .update({ status: "CANCELLED" })
        .eq("id", transferId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast({
        title: "ยกเลิกการโอนสำเร็จ",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transfers,
    isLoading,
    createTransfer: createTransferMutation.mutateAsync,
    isCreating: createTransferMutation.isPending,
    approveTransfer: approveTransferMutation.mutateAsync,
    isApproving: approveTransferMutation.isPending,
    receiveTransfer: receiveTransferMutation.mutateAsync,
    isReceiving: receiveTransferMutation.isPending,
    cancelTransfer: cancelTransferMutation.mutateAsync,
    isCancelling: cancelTransferMutation.isPending,
  };
}
