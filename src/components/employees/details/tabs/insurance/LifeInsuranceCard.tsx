import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface LifeInsuranceCardProps {
  life: any;
}

export const LifeInsuranceCard = ({ life }: LifeInsuranceCardProps) => {
  if (!life) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <CardTitle>Risikolebensversicherung</CardTitle>
          </div>
          <Badge className="bg-purple-500">Gruppenvertrag</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Versicherungssumme */}
        <div>
          <div className="text-sm text-muted-foreground">Versicherungssumme</div>
          <div className="text-3xl font-bold text-purple-600">
            {life.insurance_sum?.toLocaleString('de-DE')} €
          </div>
          <div className="text-xs text-muted-foreground">{life.purpose}</div>
        </div>
        
        {/* Beitrag */}
        <div>
          <div className="text-sm text-muted-foreground">Monatlicher Beitrag</div>
          <div className="text-xl font-bold text-green-600">0 €</div>
          <div className="text-xs text-muted-foreground">100% Arbeitgeber</div>
        </div>
        
        {/* Versicherer & Bezugsberechtigt */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Versicherer</div>
            <div className="font-medium">{life.provider}</div>
            <div className="text-xs text-muted-foreground">{life.contract_number}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Bezugsberechtigt</div>
            <div className="font-medium">{life.beneficiaries}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
