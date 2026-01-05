import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, QrCode } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileTabProps {
  employee: Employee;
}

export const ProfileTab = ({ employee }: ProfileTabProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mitarbeiter-ID für QR-Code
  const employeeIdentifier = employee.employee_number || employee.id;
  const qrValue = JSON.stringify({
    type: 'employee_badge',
    id: employee.id,
    employee_number: employee.employee_number,
    name: `${employee.first_name} ${employee.last_name}`,
  });

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `mitarbeiterausweis-${employeeIdentifier}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast({ title: "QR-Code heruntergeladen" });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [employeeIdentifier, toast]);

  const handlePrint = useCallback(() => {
    window.print();
    toast({ title: "Druckdialog geöffnet" });
  }, [toast]);

  // Formatiere Datum
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Persönliche Stammdaten */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>Persönliche Stammdaten</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vorname</p>
              <p className="font-medium">{employee.first_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nachname</p>
              <p className="font-medium">{employee.last_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Geburtsdatum</p>
              <p className="font-medium">{formatDate(employee.birth_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Geschlecht</p>
              <p className="font-medium">{employee.gender || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nationalität</p>
              <p className="font-medium">{employee.nationality || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Adresse</p>
              <p className="font-medium">
                {employee.street || employee.postal_code || employee.city 
                  ? `${employee.street || ''}, ${employee.postal_code || ''} ${employee.city || ''}`.trim().replace(/^,\s*/, '')
                  : '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Sozialversicherung & Steuern */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>Sozialversicherung & Steuern</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Sozialversicherungsnummer</p>
                {employee.social_security_number && (
                  <Badge variant="secondary" className="text-xs">Geschützt</Badge>
                )}
              </div>
              <p className="font-medium">
                {employee.social_security_number 
                  ? `***-***-**${employee.social_security_number.slice(-2)}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Steuerklasse</p>
              <p className="font-medium">{employee.tax_class || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Steuer-ID</p>
              <p className="font-medium">{employee.tax_id || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Krankenkasse</p>
              <p className="font-medium">{employee.health_insurance || '-'}</p>
            </div>
          </div>
        </Card>

        {/* Vertragsdaten */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>Vertragsdaten</span>
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Eintrittsdatum</p>
              <p className="font-medium">{formatDate(employee.start_date)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground mb-1">Beschäftigungsart</p>
                {employee.status === 'active' && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Aktiv</Badge>
                )}
              </div>
              <p className="font-medium">{employee.employment_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Abteilung</p>
              <p className="font-medium">{employee.department || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Position</p>
              <p className="font-medium">{employee.position || '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Kontaktinformationen */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>Kontaktinformationen</span>
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">E-Mail (geschäftlich)</p>
              <p className="font-medium">{employee.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Telefon (geschäftlich)</p>
              <p className="font-medium">{employee.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mobil (privat)</p>
              <p className="font-medium">{employee.mobile_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notfallkontakt</p>
              <p className="font-medium">
                {employee.emergency_contact_name || employee.emergency_contact_phone
                  ? `${employee.emergency_contact_name || ''}, ${employee.emergency_contact_phone || ''}`.trim().replace(/^,\s*/, '')
                  : '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Bankverbindung */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>Bankverbindung</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">IBAN</p>
                {employee.iban && (
                  <Badge variant="secondary" className="text-xs">Maskiert</Badge>
                )}
              </div>
              <p className="font-medium">
                {employee.iban 
                  ? `${employee.iban.slice(0, 4)} **** **** ***${employee.iban.slice(-2)}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">BIC</p>
              <p className="font-medium">{employee.bic || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kontoinhaber</p>
              <p className="font-medium">
                {employee.first_name && employee.last_name 
                  ? `${employee.first_name} ${employee.last_name}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kreditinstitut</p>
              <p className="font-medium">{employee.bank_name || '-'}</p>
            </div>
          </div>
        </Card>

        {/* Digitaler Mitarbeiterausweis */}
        <Card className="p-6 print:block">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            <span>Digitaler Mitarbeiterausweis</span>
          </h3>
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div 
              ref={qrRef}
              className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center p-4"
            >
              <QRCodeSVG 
                value={qrValue}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Mitarbeiter-ID</p>
              <p className="font-mono font-semibold">{employee.employee_number || employee.id.slice(0, 8)}</p>
            </div>
            <div className="flex gap-2 w-full print:hidden">
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                size="sm"
                onClick={handleDownloadQR}
              >
                <Download className="w-4 h-4" />
                QR-Code herunterladen
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                Badge drucken
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center print:hidden">
              Für Zeiterfassung & Zutrittskontrolle
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
