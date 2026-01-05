import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, Calendar, CheckCircle2, Clock, Shield, ClipboardList } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";
import { useAuth } from "@/hooks/useAuth";

interface MobileDashboardProps {
  userRole: 'planner' | 'manager' | 'employee';
}

export const WorkforceMobileDashboard = ({ userRole }: MobileDashboardProps) => {
  const { dashboardKPIs, isLoading } = useWorkforceExtended();
  const { user } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading Mobile Dashboard...</div>;
  }

  // Dashboard Layout für Planer/HR
  if (userRole === 'planner') {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Gap Today */}
          <Card className="tap-highlight-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Unterdeckung heute</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardKPIs.gapToday.toFixed(1)} h</div>
              <p className="text-xs text-muted-foreground">Stunden fehlen</p>
            </CardContent>
          </Card>

          {/* Coverage Week */}
          <Card className="tap-highlight-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Abdeckungsgrad</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardKPIs.coverageThisWeek.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Diese Woche</p>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Certifications */}
        <Card className="tap-highlight-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Zertifikate laufen ab (30T)</CardTitle>
              <Shield className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardKPIs.expiringCerts.slice(0, 3).map((cert, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{cert.certification_name || cert.skill_name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('de-DE') : 'Unbekannt'}
                  </Badge>
                </div>
              ))}
              {dashboardKPIs.expiringCerts.length === 0 && (
                <p className="text-sm text-muted-foreground">Keine ablaufenden Zertifikate</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3" asChild>
              <a href="/workforce-planning?tab=skills&filter=expiring_30">Alle anzeigen</a>
            </Button>
          </CardContent>
        </Card>

        {/* Top Gaps */}
        <Card className="tap-highlight-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Top 5 Gaps (Rolle/Skill)</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardKPIs.topGaps.slice(0, 5).map((gap, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{gap.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gap.hours.toFixed(1)}h</span>
                    <Badge variant="secondary" className={`text-xs ${
                      gap.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      gap.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {gap.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3" asChild>
              <a href="/workforce-planning?tab=overview">Übersicht öffnen</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard Layout für Manager/Teamleiter
  if (userRole === 'manager') {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Team Coverage */}
          <Card className="tap-highlight-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Teamabdeckung</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardKPIs.coverageThisWeek.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Diese Woche</p>
            </CardContent>
          </Card>

          {/* Overtime Risk */}
          <Card className="tap-highlight-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Überstunden-Risiko</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardKPIs.overtimeRisk}</div>
              <p className="text-xs text-muted-foreground">Konflikte</p>
            </CardContent>
          </Card>
        </div>

        {/* Open Requests */}
        <Card className="tap-highlight-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Offene Requests</CardTitle>
              <ClipboardList className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-2xl font-bold">{dashboardKPIs.openRequests}</div>
              <p className="text-sm text-muted-foreground">Benötigen Bearbeitung</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/workforce-planning?tab=requests">Requests anzeigen</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard Layout für Mitarbeiter
  return (
    <div className="p-4 space-y-4">
      {/* My Assignments */}
      <Card className="tap-highlight-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Meine Zuweisungen (7T)</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Keine anstehenden Zuweisungen</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/workforce-planning?tab=assignments&filter=me">Alle anzeigen</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="tap-highlight-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Verfügbarkeiten & Präferenzen</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button size="sm" className="w-full">
              Verfügbarkeit bearbeiten
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Präferenzen anpassen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};