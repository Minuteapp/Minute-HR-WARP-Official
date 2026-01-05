import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download, Printer } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';

interface DigitalBadgeSectionProps {
  employee: Employee | null;
  isEditing: boolean;
}

export const DigitalBadgeSection = ({ employee, isEditing }: DigitalBadgeSectionProps) => {
  const employeeId = employee?.employee_number || `MA-${employee?.id?.slice(0, 6).toUpperCase()}`;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Digitaler Mitarbeiterausweis
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCodeSVG
            value={`employee:${employee?.id || ''}`}
            size={128}
            level="H"
            includeMargin={false}
          />
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Mitarbeiter-ID</p>
          <p className="text-sm font-bold">{employeeId}</p>
        </div>
        {/* Buttons vertically stacked */}
        <div className="flex flex-col gap-2 w-full">
          <Button variant="secondary" size="sm" className="w-full gap-2 bg-muted hover:bg-muted/80">
            <Download className="h-3 w-3" />
            QR-Code herunterladen
          </Button>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Printer className="h-3 w-3" />
            Badge drucken
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Für Zeiterfassung & Zutrittskontrolle
        </p>
      </CardContent>
    </Card>
  );
};
