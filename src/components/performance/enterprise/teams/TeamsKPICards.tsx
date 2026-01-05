import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, ThumbsUp, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";

export function TeamsKPICards() {
  const { data } = useQuery({
    queryKey: ["teams-kpis"],
    queryFn: async () => {
      const [teamsResult, perfResult, empResult] = await Promise.all([
        supabase.from("teams").select("id"),
        supabase.from("team_performance").select("overall_score").eq("period", "current"),
        supabase.from("employees").select("id")
      ]);
      const teams = teamsResult.data || [];
      const performances = perfResult.data || [];
      const employees = empResult.data || [];
      const avgScore = performances.length > 0 ? performances.reduce((s, p) => s + (p.overall_score || 0), 0) / performances.length : 0;
      return { total: teams.length, employees: employees.length, avgScore, strong: performances.filter(p => (p.overall_score || 0) >= 75).length, needsHelp: performances.filter(p => (p.overall_score || 0) < 50).length };
    }
  });

  const kpis = [
    { icon: Users, label: "Gesamt-Teams", value: data?.total || 0, subtitle: `${data?.employees || 0} Mitarbeiter`, color: "purple" },
    { icon: TrendingUp, label: "Durchschnittsscore", value: Math.round(data?.avgScore || 0), subtitle: <PerformanceProgressBar value={data?.avgScore || 0} size="sm" showLabel={false} />, color: "blue" },
    { icon: ThumbsUp, label: "Entwicklung stark", value: data?.strong || 0, subtitle: "Teams über 75 Punkte", color: "green" },
    { icon: AlertTriangle, label: "Unterstützung benötigt", value: data?.needsHelp || 0, subtitle: "Teams unter 50 Punkte", color: "red" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card key={i}><CardContent className="p-4"><div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-${kpi.color}-100`}><kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} /></div>
          <div className="flex-1"><p className="text-xs text-muted-foreground">{kpi.label}</p><p className="text-2xl font-bold">{kpi.value}</p><div className="text-xs text-muted-foreground">{kpi.subtitle}</div></div>
        </div></CardContent></Card>
      ))}
    </div>
  );
}
