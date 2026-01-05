import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScanResult {
  text: string;
  rawValue: string;
  format: string;
}

export const useQRCodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<QRCodeScanResult | null>(null);
  const { toast } = useToast();

  const startScan = async (): Promise<QRCodeScanResult | null> => {
    try {
      setIsScanning(true);

      // In einer echten mobilen App würde hier BarcodeScanner von Capacitor verwendet
      // Für Web-Fallback simulieren wir einen QR-Code Scanner
      
      // Web-basierte Lösung (vereinfacht)
      if (typeof window !== 'undefined' && 'navigator' in window) {
        try {
          // Prüfe ob getUserMedia verfügbar ist
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Hier würde eine echte Kamera-basierte QR-Code Scanner Implementierung stehen
            // Für das Demo verwenden wir Input
            const qrCode = prompt('QR-Code eingeben oder Employee ID:');
            
            if (qrCode) {
              const result: QRCodeScanResult = {
                text: qrCode,
                rawValue: qrCode,
                format: 'QR_CODE'
              };
              
              setLastScanResult(result);
              
              toast({
                title: "QR-Code gescannt",
                description: `Code: ${qrCode}`,
                variant: "default"
              });
              
              return result;
            }
          }
        } catch (cameraError) {
          console.warn('Kamera-Zugriff fehlgeschlagen:', cameraError);
        }
      }

      return null;

    } catch (error: any) {
      console.error('QR-Code Scan fehlgeschlagen:', error);
      
      toast({
        title: "Scanner-Fehler",
        description: "QR-Code konnte nicht gescannt werden. Versuchen Sie es erneut.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const validateQRCode = (qrCode: string, validCodes: string[]): boolean => {
    return validCodes.includes(qrCode);
  };

  const validateEmployeeId = (employeeId: string): boolean => {
    // Einfache Validierung - Employee ID sollte alphanumerisch sein
    return /^[A-Za-z0-9]{3,10}$/.test(employeeId);
  };

  const parseQRCodeData = (qrCode: string) => {
    try {
      // Versuche JSON zu parsen
      const data = JSON.parse(qrCode);
      return {
        type: 'structured',
        locationId: data.locationId,
        companyId: data.companyId,
        timestamp: data.timestamp,
        raw: qrCode
      };
    } catch {
      // Einfacher Text
      return {
        type: 'simple',
        value: qrCode,
        raw: qrCode
      };
    }
  };

  return {
    isScanning,
    lastScanResult,
    startScan,
    validateQRCode,
    validateEmployeeId,
    parseQRCodeData
  };
};