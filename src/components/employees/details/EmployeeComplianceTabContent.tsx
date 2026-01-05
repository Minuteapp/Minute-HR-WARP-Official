import { Shield, Plus, CheckCircle2, AlertTriangle, Clock, FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface EmployeeComplianceTabContentProps {
  employeeId: string;
}

export const EmployeeComplianceTabContent = ({ employeeId }: EmployeeComplianceTabContentProps) => {
  const { canCreate } = useEnterprisePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Echte Daten für Compliance-Schulungen
  const { data: complianceTrainings = [], isLoading } = useQuery({
    queryKey: ['employee-compliance-trainings', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_trainings')
        .select(`
          *,
          training_sessions (
            id, 
            title, 
            category,
            is_mandatory
          )
        `)
        .eq('employee_id', employeeId)
        .eq('training_sessions.category', 'compliance');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  // Leerer Zustand
  if (!isLoading && complianceTrainings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Compliance Hub</h2>
          {canCreate('employee_compliance') && (
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              Compliance-Eintrag hinzufügen
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Compliance-Daten vorhanden</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Für diesen Mitarbeiter wurden noch keine Compliance-Informationen hinterlegt.
            </p>
            {canCreate('employee_compliance') && (
              <Button className="mt-6 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Compliance-Eintrag hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Berechne Compliance-Status
  const completedCount = complianceTrainings.filter(t => t.status === 'completed').length;
  const totalCount = complianceTrainings.length;
  const complianceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compliance Hub</h2>
        {canCreate('employee_compliance') && (
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            Compliance-Eintrag hinzufügen
          </Button>
        )}
      </div>

      {/* Übersichtskarten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Abgeschlossen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {complianceTrainings.filter(t => t.status === 'in_progress').length}
                </p>
                <p className="text-sm text-muted-foreground">In Bearbeitung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{complianceRate}%</p>
                <p className="text-sm text-muted-foreground">Compliance-Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schulungsliste */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Compliance-Schulungen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {complianceTrainings.map((training) => (
            <div
              key={training.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  training.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {training.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {training.training_sessions?.title || 'Compliance-Schulung'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {training.training_sessions?.is_mandatory ? 'Pflichtschulung' : 'Optional'}
                  </p>
                </div>
              </div>
              <Badge variant={training.status === 'completed' ? 'default' : 'secondary'}>
                {training.status === 'completed' ? 'Abgeschlossen' : 'Ausstehend'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Compliance-Daten werden regelmäßig aktualisiert. Pflichtschulungen müssen fristgerecht absolviert werden.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
