import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Users, Clock } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";

export const WorkforceOverview = () => {
  const { gaps, dashboardKPIs, isLoading } = useWorkforceExtended();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Heatmap/Gap Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unterdeckung Heute</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardKPIs.gapToday.toFixed(1)} h</div>
            <p className="text-xs text-muted-foreground">
              Stunden fehlen heute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abdeckungsgrad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardKPIs.coverageThisWeek.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Diese Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritische Gaps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gaps?.filter(g => g.severity === 'critical').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sofortige Aufmerksamkeit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überstunden-Risiko</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardKPIs.overtimeRisk}</div>
            <p className="text-xs text-muted-foreground">
              Konflikte in Planung
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Gaps Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Gaps nach Abteilung/Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gaps?.slice(0, 5).map((gap) => (
              <div key={gap.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {gap.department || 'Unbekannte Abteilung'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fehlende Skills: {gap.missing_skills.join(', ') || 'Allgemein'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Woche vom {new Date(gap.week_start).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="font-bold">{gap.gap_hours.toFixed(1)} h</div>
                  <div className="text-sm text-muted-foreground">
                    {gap.gap_fte.toFixed(2)} FTE
                  </div>
                  <Badge variant="secondary" className={getSeverityColor(gap.severity)}>
                    {gap.severity}
                  </Badge>
                </div>
              </div>
            ))}
            {(!gaps || gaps.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Gaps gefunden</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};