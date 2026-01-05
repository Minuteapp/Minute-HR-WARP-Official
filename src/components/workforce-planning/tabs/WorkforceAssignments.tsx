import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";

export const WorkforceAssignments = () => {
  const { assignments, updateAssignment, isLoading } = useWorkforceExtended();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConflictColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'violation': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const assignmentStats = assignments?.reduce((acc, assignment) => {
    acc.total++;
    if (assignment.status === 'planned') acc.planned++;
    if (assignment.status === 'confirmed') acc.confirmed++;
    if (assignment.conflict_level !== 'none') acc.conflicts++;
    if (assignment.compliance_status !== 'compliant') acc.complianceIssues++;
    return acc;
  }, { total: 0, planned: 0, confirmed: 0, conflicts: 0, complianceIssues: 0 }) || 
  { total: 0, planned: 0, confirmed: 0, conflicts: 0, complianceIssues: 0 };

  // Group assignments by week
  const groupedAssignments = assignments?.reduce((acc, assignment) => {
    const weekStart = new Date(assignment.assignment_date);
    const monday = new Date(weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1));
    const weekKey = monday.toISOString().split('T')[0];
    
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments>) || {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Zuweisungen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Alle Zeiträume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bestätigte Termine</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentStats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Endgültig geplant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konflikte</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentStats.conflicts}</div>
            <p className="text-xs text-muted-foreground">
              Benötigen Aufmerksamkeit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance-Probleme</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentStats.complianceIssues}</div>
            <p className="text-xs text-muted-foreground">
              Regelverstöße
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Assignment Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Wochenplanung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedAssignments)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .slice(0, 4) // Show last 4 weeks
              .map(([weekStart, weekAssignments]) => (
                <div key={weekStart} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">
                    Woche vom {new Date(weekStart).toLocaleDateString('de-DE')}
                  </h3>
                  <div className="space-y-3">
                    {weekAssignments?.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            Mitarbeiter: {assignment.user_id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(assignment.assignment_date).toLocaleDateString('de-DE')}
                            {assignment.start_time && assignment.end_time && 
                              ` • ${assignment.start_time} - ${assignment.end_time}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.assigned_hours} Stunden • {assignment.location || 'Kein Standort'}
                          </div>
                          {assignment.compliance_notes && (
                            <div className="text-sm text-red-600 mt-1">
                              {assignment.compliance_notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                            {assignment.conflict_level !== 'none' && (
                              <Badge variant="secondary" className={getConflictColor(assignment.conflict_level)}>
                                {assignment.conflict_level} Konflikt
                              </Badge>
                            )}
                            {assignment.compliance_status !== 'compliant' && (
                              <Badge variant="secondary" className={getComplianceColor(assignment.compliance_status)}>
                                {assignment.compliance_status}
                              </Badge>
                            )}
                          </div>
                          {assignment.status === 'planned' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAssignment.mutate({
                                id: assignment.id,
                                updates: { status: 'confirmed' }
                              })}
                              disabled={updateAssignment.isPending}
                            >
                              Bestätigen
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {Object.keys(groupedAssignments).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Zuweisungen gefunden</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drag & Drop Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Users2 className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-800">Drag & Drop Planung</div>
              <div className="text-sm text-blue-600">
                Ziehen Sie Mitarbeiter zwischen Terminen, um Zuweisungen zu ändern. 
                Konflikte und Compliance-Verstöße werden automatisch erkannt.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};