import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiggyBank } from "lucide-react";
import { format } from "date-fns";

interface VLContract {
  contract_type: string;
  provider?: string;
  monthly_employer: number;
  monthly_employee: number;
  contract_start?: string;
  contract_duration?: number;
  total_accumulated: number;
  eligible_for_bonus: boolean;
}

interface VLCardProps {
  vl?: VLContract;
}

const contractTypeLabels: Record<string, string> = {
  bausparen: "Bausparer",
  fondssparplan: "Fondssparplan",
  banksparplan: "Banksparplan",
  other: "Sonstiges",
};

export const VLCard = ({ vl }: VLCardProps) => {
  if (!vl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Vermögenswirksame Leistungen (VL)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine VL-Verträge vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  const yearlyEmployer = Number(vl.monthly_employer) * 12;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Vermögenswirksame Leistungen (VL)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Arbeitgeber-Anteil</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Number(vl.monthly_employer).toFixed(2)} €
            </div>
            <div className="text-sm text-muted-foreground">/Monat</div>
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {yearlyEmployer.toFixed(2)} €/Jahr
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">VL-Vertrag</div>
            <div className="text-lg font-bold">
              {contractTypeLabels[vl.contract_type] || vl.contract_type}
            </div>
            {vl.provider && (
              <div className="text-sm text-muted-foreground">{vl.provider}</div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Laufzeit</div>
            {vl.contract_duration && (
              <div className="text-lg font-bold">{vl.contract_duration} Jahre</div>
            )}
            {vl.contract_start && (
              <div className="text-sm text-muted-foreground">
                Seit {format(new Date(vl.contract_start), 'MMM yyyy')}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Gesamt eingezahlt</div>
            <div className="text-2xl font-bold">
              {Number(vl.total_accumulated).toFixed(2)} €
            </div>
            {vl.eligible_for_bonus && (
              <Badge className="bg-green-500 hover:bg-green-600 mt-1">
                Arbeitnehmersparzulage
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
