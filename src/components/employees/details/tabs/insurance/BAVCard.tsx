import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, Download, Edit } from "lucide-react";
import { format } from "date-fns";
import { useInsurancePDFExport } from "@/hooks/useInsurancePDFExport";
import { EditBAVDialog } from "./EditBAVDialog";
import { useState } from "react";

interface BAVCardProps {
  bav: any;
}

export const BAVCard = ({ bav }: BAVCardProps) => {
  const { exportSingleInsuranceToPDF } = useInsurancePDFExport();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  if (!bav) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle>Betriebliche Altersvorsorge (BAV)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 4 Statistik-Karten Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Arbeitgeber-Anteil */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Arbeitgeber-Anteil</div>
              <div className="text-3xl font-bold">{bav.employer_contribution} €</div>
              <div className="text-sm text-muted-foreground">/ Monat</div>
              <div className="text-xs text-green-600 mt-1">
                {(bav.employer_contribution * 12).toFixed(0)} € / Jahr
              </div>
            </CardContent>
          </Card>
          
          {/* 2. Arbeitnehmer-Anteil */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Arbeitnehmer-Anteil</div>
              <div className="text-3xl font-bold">{bav.employee_contribution} €</div>
              <div className="text-sm text-muted-foreground">/ Monat</div>
              <div className="text-xs text-muted-foreground mt-1">
                Entgeltumwandlung
              </div>
            </CardContent>
          </Card>
          
          {/* 3. Versicherungssumme */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Versicherungssumme</div>
              <div className="text-3xl font-bold text-green-600">
                {bav.insurance_sum?.toLocaleString('de-DE')} €
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Bei Renteneintritt
              </div>
            </CardContent>
          </Card>
          
          {/* 4. Einzahlungen gesamt */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Einzahlungen gesamt</div>
              <div className="text-3xl font-bold">
                {bav.total_contributions?.toLocaleString('de-DE')} €
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Seit {bav.contributions_since ? format(new Date(bav.contributions_since), 'MMM yyyy') : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Details-Sektion */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Anbieter</div>
            <div className="font-medium">{bav.provider}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Vertragsnummer</div>
            <div className="font-medium">{bav.contract_number}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Laufzeit</div>
            <div className="font-medium">Bis Renteneintritt 2054</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Vertrag anzeigen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSingleInsuranceToPDF(bav, "BAV", "Mitarbeiter")}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
      </CardContent>
      
      <EditBAVDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        bav={bav}
      />
    </Card>
  );
};
