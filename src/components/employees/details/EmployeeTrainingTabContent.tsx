import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Target, GraduationCap, Plus, Info } from "lucide-react";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface EmployeeTrainingTabContentProps extends EmployeeTabEditProps {}

export const EmployeeTrainingTabContent = ({ 
  employeeId,
  isEditing = false,
  onFieldChange,
  pendingChanges
}: EmployeeTrainingTabContentProps) => {
  const { canCreate } = useEnterprisePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Echte Daten für Schulungen aus der Datenbank
  const { data: ongoingTrainings = [], isLoading: loadingOngoing } = useQuery({
    queryKey: ['employee-ongoing-trainings', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_trainings')
        .select(`
          *,
          training_sessions (
            id, 
            title, 
            start_date, 
            end_date, 
            status
          )
        `)
        .eq('employee_id', employeeId)
        .in('status', ['registered', 'in_progress']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  // Abgeschlossene Schulungen
  const { data: completedTrainings = [], isLoading: loadingCompleted } = useQuery({
    queryKey: ['employee-completed-trainings', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_trainings')
        .select(`
          *,
          training_sessions (
            id, 
            title, 
            start_date, 
            end_date
          )
        `)
        .eq('employee_id', employeeId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  const isLoading = loadingOngoing || loadingCompleted;

  // Leerer Zustand wenn keine Daten
  if (!isLoading && ongoingTrainings.length === 0 && completedTrainings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Weiterbildung</h2>
          {canCreate('employee_training') && (
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              Schulung hinzufügen
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Schulungsdaten vorhanden</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Für diesen Mitarbeiter wurden noch keine Schulungen oder Weiterbildungen erfasst.
            </p>
            {canCreate('employee_training') && (
              <Button className="mt-6 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Erste Schulung hinzufügen
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
        <h2 className="text-xl font-semibold">Weiterbildung</h2>
        {canCreate('employee_training') && (
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            Schulung hinzufügen
          </Button>
        )}
      </div>

      {/* Laufende und Abgeschlossene Schulungen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Laufende Schulungen */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Laufende Schulungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ongoingTrainings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Keine laufenden Schulungen</p>
              </div>
            ) : (
              ongoingTrainings.map((training) => (
                <div key={training.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {training.training_sessions?.title || 'Schulung'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {training.training_sessions?.start_date && 
                          new Date(training.training_sessions.start_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${
                        training.status === "in_progress"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {training.status === "in_progress" ? "aktiv" : "registriert"}
                    </Badge>
                  </div>
                  {training.progress !== null && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Fortschritt</span>
                        <span className="font-bold">{training.progress}%</span>
                      </div>
                      <Progress value={training.progress || 0} className="h-2" />
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Abgeschlossene Schulungen */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Abgeschlossene Schulungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTrainings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Keine abgeschlossenen Schulungen</p>
              </div>
            ) : (
              completedTrainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {training.training_sessions?.title || 'Schulung'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {training.completed_at && 
                          new Date(training.completed_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                  {training.score !== null && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{training.score}%</div>
                      <div className="text-xs text-green-600 font-medium">Zertifikat</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lernziele & Entwicklungsplan */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Lernziele & Entwicklungsplan</CardTitle>
            </div>
            {canCreate('employee_development_plan') && (
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Lernziel hinzufügen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Lernziele definiert</p>
            <p className="text-xs mt-1">Lernziele können hier hinzugefügt werden</p>
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Schulungsdaten werden aus der Datenbank geladen. Bei Fragen wenden Sie sich an die Personalabteilung.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
