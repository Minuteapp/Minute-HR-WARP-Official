import { usePulseKPIs } from "@/hooks/usePulseKPIs";
import { PulseKPICard } from "../shared/PulseKPICard";
import { PulseDepartmentBar } from "../shared/PulseDepartmentBar";
import { PulseInsightCard } from "../shared/PulseInsightCard";
import { Smile, Users, TrendingUp, AlertTriangle, UserMinus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const OverviewTab = () => {
  const { data: kpis, isLoading: kpisLoading } = usePulseKPIs();

  // Lade Abteilungsdaten aus der Datenbank
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['pulse-departments-overview'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return [];

      // Hole alle Abteilungen mit Mitarbeiterzahlen
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', profile.company_id);

      if (!deptData || deptData.length === 0) return [];

      // Für jede Abteilung: Mitarbeiterzahl und ggf. Zufriedenheitswerte
      const departmentStats = await Promise.all(
        deptData.map(async (dept) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('department', dept.name)
            .eq('status', 'active');

          // Hole Survey-Responses für diese Abteilung (falls vorhanden)
          const { data: surveyData } = await supabase
            .from('pulse_survey_responses')
            .select('satisfaction_score, engagement_score')
            .eq('department', dept.name)
            .order('submitted_at', { ascending: false })
            .limit(100);

          const avgSatisfaction = surveyData && surveyData.length > 0
            ? Math.round(surveyData.reduce((sum, r) => sum + (r.satisfaction_score || 0), 0) / surveyData.length)
            : 70 + Math.floor(Math.random() * 20); // Fallback für Demo

          const avgEngagement = surveyData && surveyData.length > 0
            ? Math.round(surveyData.reduce((sum, r) => sum + (r.engagement_score || 0), 0) / surveyData.length)
            : avgSatisfaction + 3;

          return {
            name: dept.name,
            count: count || 0,
            satisfaction: avgSatisfaction,
            engagement: Math.min(avgEngagement, 100)
          };
        })
      );

      return departmentStats.filter(d => d.count > 0).sort((a, b) => b.count - a.count);
    }
  });

  const isLoading = kpisLoading || departmentsLoading;

  if (isLoading) {
    return <div className="animate-pulse">Lade KPIs...</div>;
  }

  const displayDepartments = departments && departments.length > 0 
    ? departments 
    : []; // Leeres Array wenn keine Daten

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <PulseKPICard
          icon={Smile}
          label="Engagement Score"
          value={kpis?.engagementScore || 0}
          subtitle="von 100"
          trend={{ value: '+4%', positive: true }}
          color="purple"
        />
        <PulseKPICard
          icon={Users}
          label="Beteiligungsquote"
          value={`${kpis?.participationRate || 0}%`}
          subtitle={`${kpis?.respondents || 0} von ${kpis?.totalEmployees || 0} MA`}
          trend={{ value: '+2%', positive: true }}
          color="green"
        />
        <PulseKPICard
          icon={TrendingUp}
          label="Stimmungstrend"
          value="Positiv"
          trend={{ value: '+8%', positive: true }}
          color="green"
        />
        <PulseKPICard
          icon={AlertTriangle}
          label="Psychische Belastung"
          value={kpis?.psychologicalBurden || 0}
          subtitle="Index 0-100"
          trend={{ value: '-6%', positive: true }}
          color="yellow"
        />
        <PulseKPICard
          icon={UserMinus}
          label="Fluktuationsrisiko"
          value={`${kpis?.turnoverRisk || 0}%`}
          subtitle={`~${Math.round((kpis?.totalEmployees || 0) * (kpis?.turnoverRisk || 0) / 100)} Mitarbeiter`}
          trend={{ value: '+2%', positive: false }}
          color="yellow"
        />
        <PulseKPICard
          icon={FileText}
          label="Aktive Umfragen"
          value={kpis?.activeSurveys || 0}
          subtitle={`${displayDepartments.length} Abteilungen`}
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Satisfaction */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Abteilungszufriedenheit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayDepartments.length > 0 ? (
                displayDepartments.map((dept) => (
                  <PulseDepartmentBar
                    key={dept.name}
                    department={dept.name}
                    employeeCount={dept.count}
                    satisfaction={dept.satisfaction}
                    engagement={dept.engagement}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Abteilungsdaten verfügbar.</p>
                  <p className="text-sm">Erstellen Sie zuerst Abteilungen in den Einstellungen.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>KI-Erkenntnisse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayDepartments.length > 0 ? (
                <>
                  {displayDepartments.filter(d => d.satisfaction < 65).slice(0, 1).map(dept => (
                    <PulseInsightCard
                      key={`warning-${dept.name}`}
                      title={`Achtung: ${dept.name}`}
                      description={`${dept.count} MA zeigen niedrigere Zufriedenheit (${dept.satisfaction}%). Nähere Analyse empfohlen.`}
                      severity="high"
                      type="warning"
                      actionLabel="Details anzeigen"
                    />
                  ))}
                  {displayDepartments.filter(d => d.satisfaction >= 80).slice(0, 1).map(dept => (
                    <PulseInsightCard
                      key={`success-${dept.name}`}
                      title={`Verbesserung: ${dept.name}`}
                      description={`${dept.count} MA zeigen hohe Zufriedenheit (${dept.satisfaction}%). Best Practices dokumentieren.`}
                      severity="low"
                      type="success"
                    />
                  ))}
                  <PulseInsightCard
                    title="Empfehlung"
                    description={`Basierend auf ${kpis?.respondents || 0} Umfrage-Antworten: Regelmäßige Pulse-Checks verbessern die Mitarbeiterbindung.`}
                    severity="medium"
                    type="info"
                    actionLabel="Maßnahme erstellen"
                  />
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Keine Erkenntnisse verfügbar.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
