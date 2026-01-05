import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface AccidentInsuranceCardProps {
  accident: any;
}

export const AccidentInsuranceCard = ({ accident }: AccidentInsuranceCardProps) => {
  if (!accident) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <CardTitle>Gruppenunfallversicherung</CardTitle>
          </div>
          <Badge className="bg-green-500">{accident.coverage_badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Versicherungssumme */}
        <div>
          <div className="text-sm text-muted-foreground">Versicherungssumme</div>
          <div className="text-3xl font-bold text-green-600">
            {accident.insurance_sum?.toLocaleString('de-DE')} €
          </div>
          <div className="text-xs text-muted-foreground">
            Bei Invalidität durch Unfall
          </div>
        </div>
        
        {/* Leistungen Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <div className="text-sm text-muted-foreground">Todesfallleistung</div>
            <div className="font-medium">{accident.death_benefit?.toLocaleString('de-DE')} €</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Tagegeld (ab Tag 1)</div>
            <div className="font-medium">{accident.daily_allowance} € / Tag</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Krankenhaustagegeld</div>
            <div className="font-medium">{accident.hospital_daily_allowance} € / Tag</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Beitrag</div>
            <div className="font-medium text-green-600">0 € (Arbeitgeber)</div>
          </div>
        </div>
        
        {/* Gültigkeitsbereich */}
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">Gültigkeitsbereich</div>
          <div className="font-medium">{accident.coverage_scope}</div>
        </div>
      </CardContent>
    </Card>
  );
};
