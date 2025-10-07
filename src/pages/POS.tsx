import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarcodeScanner } from "@/components/shared/BarcodeScanner";
import { Camera, Trash2, ShoppingCart, Plus } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
}

const POS = () => {
  const { toast } = useToast();
  const { branches } = useBranches();
  const { products } = useProducts();
  const { createSale } = useSales();

  const [branchId, setBranchId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-focus barcode input on desktop only
  useEffect(() => {
    if (window.innerWidth >= 768) {
      const input = document.getElementById("barcode-input");
      if (input) {
        input.focus();
      }
    }
  }, [cart]);

  const handleBarcodeSubmit = (barcode: string) => {
    const product = products?.find(p => p.barcode === barcode);
    
    if (product) {
      addToCart(product.id, product.name_th, product.sku, product.base_price);
      setBarcodeInput("");
    } else {
      toast({
        title: "ไม่พบสินค้า",
        description: `ไม่พบสินค้าที่มี barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  const addToCart = (productId: string, productName: string, productSku: string, price: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === productId);
      if (existing) {
        return prev.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        product_id: productId,
        product_name: productName,
        product_sku: productSku,
        quantity: 1,
        unit_price: price,
      }];
    });

    toast({
      title: "เพิ่มสินค้าแล้ว",
      description: `${productName} x1`,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleCheckout = async () => {
    if (!branchId) {
      toast({
        title: "กรุณาเลือกสาขา",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "กรุณาเพิ่มสินค้า",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createSale({
        branch_id: branchId,
        customer_name: customerName || undefined,
        sale_date: new Date(),
        discount: 0,
        tax: 0,
        notes: "POS Sale",
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });

      // Reset form
      setCart([]);
      setCustomerName("");
      
      toast({
        title: "บันทึกการขายสำเร็จ",
        description: `ยอดรวม: ฿${calculateTotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      });
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName("");
  };

  // Filter only BRANCH type branches
  const branchOptions = branches?.filter(b => b.type === "BRANCH");

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-4 md:py-8">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">POS - ขายด่วน</h2>
          <p className="text-xs md:text-sm text-muted-foreground">ระบบขายสินค้าสำหรับร้านสาขา</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">สแกนหรือเลือกสินค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="barcode-input" className="text-sm">Barcode</Label>
                    <Input
                      id="barcode-input"
                      placeholder="สแกนหรือพิมพ์ barcode..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && barcodeInput) {
                          handleBarcodeSubmit(barcodeInput);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setScannerOpen(true)}
                      title="สแกนด้วยกล้อง"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">หรือเลือกจากรายการ</Label>
                  <Select
                    onValueChange={(productId) => {
                      const product = products?.find(p => p.id === productId);
                      if (product) {
                        addToCart(product.id, product.name_th, product.sku, product.base_price);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสินค้า..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name_th} ({product.sku}) - ฿{product.base_price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  รายการสินค้า ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">ยังไม่มีสินค้าในตะกร้า</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">{item.product_name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">{item.product_sku}</p>
                        </div>
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product_id, parseInt(e.target.value) || 0)
                            }
                            className="w-16 text-center text-sm"
                            min="1"
                          />
                          <span className="w-20 text-right font-medium text-sm md:text-base">
                            ฿{(item.quantity * item.unit_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product_id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Checkout */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">ข้อมูลการขาย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-sm">สาขา *</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสาขา" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name_th} ({branch.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer" className="text-sm">ชื่อลูกค้า (ไม่บังคับ)</Label>
                  <Input
                    id="customer"
                    placeholder="ชื่อลูกค้า..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-base md:text-lg font-bold">
                    <span>ยอดรวมทั้งหมด</span>
                    <span>฿{calculateTotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || !branchId || isProcessing}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isProcessing ? "กำลังบันทึก..." : "ชำระเงิน"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearCart}
                    disabled={cart.length === 0}
                  >
                    ล้างรายการ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleBarcodeSubmit}
      />
    </MainLayout>
  );
};

export default POS;