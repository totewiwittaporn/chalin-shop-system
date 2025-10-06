import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Warehouse, Plus, Search, Package, AlertTriangle, Loader2 } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useBranches } from "@/hooks/useBranches";
import { StockAdjustDialog } from "@/components/inventory/StockAdjustDialog";

const Inventory = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const { inventory, isLoading, adjustStock } = useInventory();
  const { branches } = useBranches();

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.products?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.products?.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.products?.name_en.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === "all" || item.branch_id === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  const handleAdjustStock = async (data: any) => {
    await adjustStock(data);
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: "หมด", variant: "destructive" as const };
    if (quantity <= minStock) return { label: "ต่ำ", variant: "destructive" as const };
    return { label: "ปกติ", variant: "default" as const };
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">คลังสินค้า / Inventory</h2>
            <p className="text-sm text-muted-foreground">ตรวจสอบและจัดการสต็อกสินค้า</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            ปรับสต็อก
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                รายการสต็อกสินค้า
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="ทุกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสาขา</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.code} - {branch.name_th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาสินค้า..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery || selectedBranch !== "all" ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีสต็อกสินค้า"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สาขา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">สินค้า</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ประเภท</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">คงเหลือ</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">ขั้นต่ำ</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">มูลค่า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const status = getStockStatus(item.quantity, item.min_stock);
                      const value = (item.products?.base_price || 0) * item.quantity;

                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{item.branches?.name_th}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {item.branches?.code}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">{item.products?.sku}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{item.products?.name_th}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.products?.name_en}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.products?.product_types ? (
                              <Badge variant="outline" className="text-xs">
                                {item.products.product_types.code}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-lg">{item.quantity}</span>
                            <span className="text-sm text-muted-foreground ml-1">ชิ้น</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                            {item.min_stock}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={status.variant} className="gap-1">
                              {item.quantity <= item.min_stock && (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            ฿{value.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <StockAdjustDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleAdjustStock}
        />
      </div>
    </MainLayout>
  );
};

export default Inventory;
