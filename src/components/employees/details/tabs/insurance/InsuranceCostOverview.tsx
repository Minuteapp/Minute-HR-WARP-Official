import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useInsurancePDFExport } from "@/hooks/useInsurancePDFExport";
import { useMemo } from "react";

interface InsuranceCostOverviewProps {
  insuranceData: any;
}

export const InsuranceCostOverview = ({ insuranceData }: InsuranceCostOverviewProps) => {
  const { exportAllInsurancesToPDF } = useInsurancePDFExport();
  const { totalEmployerContribution, totalEmployeeContribution, taxSavings, totalCoverage } = useMemo(() => {
    let employerTotal = 0;
    let employeeTotal = 0;
    let coverage = 0;

    if (insuranceData.bav) {
      employerTotal += Number(insuranceData.bav.employer_contribution) || 0;
      employeeTotal += Number(insuranceData.bav.employee_contribution) || 0;
      coverage += Number(insuranceData.bav.insurance_sum) || 0;
    }

    if (insuranceData.health) {
      employerTotal += Number(insuranceData.health.employer_contribution) || 0;
      employeeTotal += Number(insuranceData.health.employee_contribution) || 0;
    }

    if (insuranceData.disability) {
      employerTotal += Number(insuranceData.disability.employer_contribution) || 0;
      employeeTotal += Number(insuranceData.disability.employee_contribution) || 0;
    }

    if (insuranceData.accident) {
      coverage += Number(insuranceData.accident.insurance_sum) || 0;
    }

    if (insuranceData.life) {
      coverage += Number(insuranceData.life.insurance_sum) || 0;
    }

    // Geschätzte Steuerersparnis (ca. 30% der Entgeltumwandlung)
    const savings = (employeeTotal * 0.3).toFixed(2);

    return {
      totalEmployerContribution: employerTotal.toFixed(2),
      totalEmployeeContribution: employeeTotal.toFixed(2),
      taxSavings: savings,
      totalCoverage: coverage,
    };
  }, [insuranceData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Übersicht Versicherungskosten
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportAllInsurancesToPDF(insuranceData, "Mitarbeiter")}
        >
          <Download className="h-4 w-4 mr-2" />
          Alle Dokumente herunterladen
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Arbeitgeber-Anteil gesamt - GRÜN */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Arbeitgeber-Anteil gesamt</div>
            <div className="text-3xl font-bold text-green-600">
              {totalEmployerContribution} €
            </div>
            <div className="text-sm text-muted-foreground">/ Monat</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(Number(totalEmployerContribution) * 12).toFixed(0)} € / Jahr
            </div>
          </CardContent>
        </Card>
        
        {/* 2. Arbeitnehmer-Anteil gesamt */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Arbeitnehmer-Anteil gesamt</div>
            <div className="text-3xl font-bold">{totalEmployeeContribution} €</div>
            <div className="text-sm text-muted-foreground">/ Monat</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(Number(totalEmployeeContribution) * 12).toFixed(0)} € / Jahr
            </div>
          </CardContent>
        </Card>
        
        {/* 3. Steuerersparnis - GRÜN */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Steuerersparnis (geschätzt)</div>
            <div className="text-3xl font-bold text-green-600">{taxSavings} €</div>
            <div className="text-sm text-muted-foreground">/ Monat</div>
            <div className="text-xs text-muted-foreground mt-1">
              Durch Entgeltumwandlung
            </div>
          </CardContent>
        </Card>
        
        {/* 4. Versicherungsschutz gesamt */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Versicherungsschutz gesamt</div>
            <div className="text-3xl font-bold">{totalCoverage.toLocaleString('de-DE')} €</div>
            <div className="text-xs text-muted-foreground mt-1">+ BAV-Rente</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
