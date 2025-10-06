import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Layers, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useProductTypes, ProductType } from "@/hooks/useProductTypes";
import { ProductTypeDialog } from "@/components/product-types/ProductTypeDialog";

const ProductTypes = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    productTypes,
    isLoading,
    createProductType,
    updateProductType,
    deleteProductType,
    isDeleting,
  } = useProductTypes();

  const filteredTypes = productTypes.filter(
    (type) =>
      type.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingType(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (type: ProductType) => {
    setEditingType(type);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteProductType(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingType) {
      await updateProductType({ id: editingType.id, input: data });
    } else {
      await createProductType(data);
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ประเภทสินค้า / Product Types</h2>
            <p className="text-sm text-muted-foreground">จัดการหมวดหมู่สินค้า</p>
          </div>
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            เพิ่มประเภทใหม่
          </Button>
        </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  รายการประเภทสินค้า
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาประเภท..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีประเภทสินค้า"}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredTypes.map((type) => (
                  <Card key={type.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                              {type.code}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{type.name_th}</h3>
                              <p className="text-sm text-muted-foreground">{type.name_en}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(type)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(type.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {type.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {type.description}
                          </p>
                        )}
                      </CardContent>
                  </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ProductTypeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            initialData={editingType}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณแน่ใจหรือไม่ที่จะลบประเภทสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  ลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default ProductTypes;
