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
import { Package, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { ProductDialog } from "@/components/products/ProductDialog";

const Products = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    | {
        id: string;
        sku: string;
        name_th: string;
        name_en: string;
        description: string;
        product_type_id: string;
        base_price: string;
      }
    | undefined
  >();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    isDeleting,
  } = useProducts();

  const filteredProducts = products.filter(
    (product) =>
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      sku: product.sku,
      name_th: product.name_th,
      name_en: product.name_en,
      description: product.description || "",
      product_type_id: product.product_type_id || "",
      base_price: product.base_price.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteProduct(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      await updateProduct({ id: editingProduct.id, input: data });
    } else {
      await createProduct(data);
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">สินค้า / Products</h2>
            <p className="text-sm text-muted-foreground">จัดการข้อมูลสินค้าทั้งหมด</p>
          </div>
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            เพิ่มสินค้าใหม่
          </Button>
        </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  รายการสินค้า
                </CardTitle>
                <div className="flex items-center gap-2">
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
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีสินค้า"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ชื่อสินค้า</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ประเภท</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ราคา</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm font-mono">{product.sku}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{product.name_th}</p>
                              <p className="text-sm text-muted-foreground">{product.name_en}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {product.product_types ? (
                              <Badge variant="outline">
                                {product.product_types.code} - {product.product_types.name_th}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">ไม่ระบุ</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ฿{product.base_price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <ProductDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            initialData={editingProduct}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณแน่ใจหรือไม่ที่จะลบสินค้านี้? การกระทำนี้จะทำให้สินค้าไม่แสดงในระบบ
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

export default Products;
