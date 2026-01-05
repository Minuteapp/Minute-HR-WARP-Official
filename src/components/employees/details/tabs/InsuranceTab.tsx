import { useEmployeeInsuranceData } from "@/integrations/supabase/hooks/useEmployeeInsurance";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Info, Plus } from "lucide-react";
import { BAVCard } from "./insurance/BAVCard";
import { HealthInsuranceCard } from "./insurance/HealthInsuranceCard";
import { DisabilityInsuranceCard } from "./insurance/DisabilityInsuranceCard";
import { AccidentInsuranceCard } from "./insurance/AccidentInsuranceCard";
import { LifeInsuranceCard } from "./insurance/LifeInsuranceCard";
import { InsuranceCostOverview } from "./insurance/InsuranceCostOverview";
import { InsuranceOptimizationTip } from "./insurance/InsuranceOptimizationTip";
import { InsuranceReminders } from "./insurance/InsuranceReminders";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useState } from "react";

interface InsuranceTabProps {
  employeeId: string;
}

export const InsuranceTab = ({ employeeId }: InsuranceTabProps) => {
  const { data: insuranceData, isLoading } = useEmployeeInsuranceData(employeeId);
  const { canCreate } = useEnterprisePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Prüfen ob überhaupt Versicherungsdaten vorhanden sind
  const hasAnyData = insuranceData && (
    insuranceData.bav || 
    insuranceData.health || 
    insuranceData.disability || 
    insuranceData.accident || 
    insuranceData.life
  );

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Versicherungen & Benefits</h2>
          {canCreate('employee_insurance') && (
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              Versicherung hinzufügen
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Versicherungsdaten verfügbar</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Für diesen Mitarbeiter wurden noch keine Versicherungen oder Benefits hinterlegt.
            </p>
            {canCreate('employee_insurance') && (
              <Button className="mt-6 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Versicherung hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Versicherungen & Benefits</h2>
        {canCreate('employee_insurance') && (
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            Versicherung hinzufügen
          </Button>
        )}
      </div>

      {/* BAV - Große Card oben */}
      {insuranceData.bav && <BAVCard bav={insuranceData.bav} />}
      
      {/* Kranken- & BU-Versicherung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insuranceData.health && (
          <HealthInsuranceCard health={insuranceData.health} />
        )}
        {insuranceData.disability && (
          <DisabilityInsuranceCard disability={insuranceData.disability} />
        )}
      </div>
      
      {/* Unfall- & Lebensversicherung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insuranceData.accident && (
          <AccidentInsuranceCard accident={insuranceData.accident} />
        )}
        {insuranceData.life && (
          <LifeInsuranceCard life={insuranceData.life} />
        )}
      </div>
      
      {/* Kostenübersicht */}
      <InsuranceCostOverview insuranceData={insuranceData} />
      
      {/* Optimierungshinweis */}
      <InsuranceOptimizationTip />
      
      {/* Versicherungs-Erinnerungen */}
      <InsuranceReminders employeeId={employeeId} />
    </div>
  );
};
