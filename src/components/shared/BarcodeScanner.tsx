import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarcodeScanner({ onScan, open, onOpenChange }: BarcodeScannerProps) {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (open && !isScanning) {
      startScanning();
    }

    return () => {
      if (scannerRef.current && isScanning) {
        stopScanning();
      }
    };
  }, [open]);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
          onOpenChange(false);
          toast({
            title: "สแกนสำเร็จ",
            description: `พบ barcode: ${decodedText}`,
          });
        },
        (errorMessage) => {
          // Ignore scanning errors - they're expected while scanning
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast({
        title: "ไม่สามารถเปิดกล้องได้",
        description: "กรุณาตรวจสอบสิทธิ์การใช้งานกล้อง",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  };

  const handleClose = () => {
    stopScanning();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            สแกน Barcode
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
          <p className="text-sm text-muted-foreground text-center">
            วางบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน
          </p>
          <Button variant="outline" className="w-full" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}