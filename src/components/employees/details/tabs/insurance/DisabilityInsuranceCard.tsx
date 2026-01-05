import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface DisabilityInsuranceCardProps {
  disability: any;
}

export const DisabilityInsuranceCard = ({ disability }: DisabilityInsuranceCardProps) => {
  if (!disability) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            <CardTitle>Berufsunfähigkeitsversicherung</CardTitle>
          </div>
          <Badge className="bg-orange-500">Arbeitgeberzahlung</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* BU-Rente */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">BU-Rente (garantiert)</div>
          <div className="text-3xl font-bold text-orange-600">
            {disability.guaranteed_monthly_benefit} €
          </div>
          <div className="text-sm text-muted-foreground">/ Monat</div>
          <div className="text-xs text-muted-foreground mt-1">
            Bei Berufsunfähigkeit ab {disability.disability_threshold}%
          </div>
        </div>
        
        {/* Beiträge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Arbeitgeber-Anteil</div>
            <div className="text-xl font-bold">{disability.employer_contribution} €</div>
            <div className="text-xs text-muted-foreground">Monatlich</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Arbeitnehmer-Anteil</div>
            <div className="text-xl font-bold">{disability.employee_contribution} €</div>
            <div className="text-xs text-muted-foreground">Optional erhöhbar</div>
          </div>
        </div>
        
        {/* Versicherer */}
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">Versicherer</div>
          <div className="font-medium">{disability.provider}</div>
          <div className="text-xs text-muted-foreground">
            Vertragsreg.: {disability.contract_number}
          </div>
        </div>
        
        {/* Leistungsumfang */}
        {disability.coverage_benefits && disability.coverage_benefits.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-2">Leistungsumfang</div>
            <ul className="space-y-1">
              {disability.coverage_benefits.map((benefit: string, idx: number) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
