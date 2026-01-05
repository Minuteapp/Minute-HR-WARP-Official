import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import type { HomeofficeAgreement } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { EditHomeofficeAgreementDialog } from "./dialogs/EditHomeofficeAgreementDialog";

interface HomeofficeAgreementCardProps {
  agreement?: HomeofficeAgreement;
}

export const HomeofficeAgreementCard = ({ agreement }: HomeofficeAgreementCardProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  if (!agreement) return null;

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Homeoffice-Vereinbarung</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {agreement.remote_percentage}% Remote - {agreement.office_percentage}% Büro
              </p>
            </div>
          </div>
          <Badge className="bg-blue-500 text-white">
            {agreement.badge_color === 'hybrid' ? 'Hybrid' : agreement.badge_color}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Homeoffice-Modell:</span>
            <span className="text-sm font-semibold">{agreement.days_per_week} Tage / Woche</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="grid gap-2">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Bevorzugte Homeoffice-Tage:</span>
                <span className="text-sm font-medium text-right">
                  {agreement.preferred_home_days.join(' • ')}
                </span>
              </div>
              
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Büro-Präsenztage:</span>
                <span className="text-sm font-medium text-right">
                  {agreement.office_days.join(' • ')}
                </span>
              </div>
              
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Kernarbeitszeit:</span>
                <span className="text-sm font-medium text-right">
                  {agreement.core_hours_start} - {agreement.core_hours_end}
                  <span className="text-xs text-muted-foreground ml-1">(Erreichbarkeit)</span>
                </span>
              </div>
              
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Gültig seit:</span>
                <span className="text-sm font-medium text-right">
                  {format(new Date(agreement.valid_since), 'dd.MM.yyyy', { locale: de })}
                  <span className="text-xs text-muted-foreground ml-1">(Letzte Aktualisierung)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full" size="sm" onClick={() => setEditDialogOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Homeoffice-Vereinbarung anpassen
        </Button>

        <EditHomeofficeAgreementDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          employeeId={agreement.employee_id}
          agreement={agreement}
        />
      </CardContent>
    </Card>
  );
};
