import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Edit } from "lucide-react";
import { EditHealthInsuranceDialog } from "./EditHealthInsuranceDialog";
import { useState } from "react";

interface HealthInsuranceCardProps {
  health: any;
}

export const HealthInsuranceCard = ({ health }: HealthInsuranceCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  if (!health) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle>Krankenversicherung</CardTitle>
          </div>
          <Badge className="bg-blue-500">
            {health.insurance_type === 'statutory' ? 'Gesetzlich' : 'Privat'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Versicherungsart */}
        <div>
          <div className="text-sm text-muted-foreground">Versicherungsart</div>
          <div className="font-semibold">{health.provider}</div>
          <div className="text-xs text-muted-foreground">
            Mitglieds-Nr.: {health.member_number}
          </div>
        </div>
        
        {/* Beiträge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Arbeitgeber-Anteil</div>
            <div className="text-xl font-bold">{health.employer_contribution} €</div>
            <div className="text-xs text-muted-foreground">Monatlich</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Arbeitnehmer-Anteil</div>
            <div className="text-xl font-bold">{health.employee_contribution} €</div>
            <div className="text-xs text-muted-foreground">Monatlich</div>
          </div>
        </div>
        
        {/* Zusatzbeitrag */}
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">Zusatzbeitrag</div>
          <div className="font-medium">{health.additional_contribution} €</div>
          <div className="text-xs text-muted-foreground">
            {(health.additional_contribution_rate * 100).toFixed(1)}% Zusatzbeitrag
          </div>
        </div>
        
        {/* Zusatzversicherungen */}
        {health.supplementary_insurances && health.supplementary_insurances.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-2">Zusatzversicherungen</div>
            <div className="space-y-2">
              {health.supplementary_insurances.map((insurance: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">{insurance.name}</span>
                  <Badge className="bg-green-500">Aktiv</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
      </CardContent>
      
      <EditHealthInsuranceDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        health={health}
      />
    </Card>
  );
};
