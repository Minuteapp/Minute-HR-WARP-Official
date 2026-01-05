import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby } from "lucide-react";
import { format } from "date-fns";

interface ChildcareBenefit {
  monthly_allowance: number;
  facility_name?: string;
  num_children: number;
  approved_since?: string;
  additional_benefits?: {
    benefits: string[];
  };
  status: string;
}

interface ChildcareCardProps {
  childcare?: ChildcareBenefit;
}

export const ChildcareCard = ({ childcare }: ChildcareCardProps) => {
  if (!childcare) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Kinderbetreuung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine Kinderbetreuungs-Benefits vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5" />
          Kinderbetreuung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">
              {Number(childcare.monthly_allowance).toFixed(2)} €
            </div>
            <div className="text-sm text-muted-foreground">/Monat</div>
          </div>
          <Badge className="bg-green-500 hover:bg-green-600">Aktiv</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {childcare.facility_name && (
            <div>
              <div className="text-sm text-muted-foreground">Einrichtung</div>
              <div className="font-medium">{childcare.facility_name}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-muted-foreground">Anzahl Kinder</div>
            <div className="font-medium">{childcare.num_children} Kinder</div>
          </div>
          {childcare.approved_since && (
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Bewilligt seit</div>
              <div className="font-medium">
                {format(new Date(childcare.approved_since), 'MMMM yyyy')}
              </div>
            </div>
          )}
        </div>

        {childcare.additional_benefits?.benefits && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-2">Weitere Angebote</div>
            <ul className="space-y-1">
              {childcare.additional_benefits.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Steuerfreie Arbeitgeberleistung nach § 3 Nr. 33 EStG
        </div>
      </CardContent>
    </Card>
  );
};
