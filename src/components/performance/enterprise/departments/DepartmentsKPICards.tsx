import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, ThumbsUp, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";

export function DepartmentsKPICards() {
  const { data } = useQuery({
    queryKey: ["departments-kpis"],
    queryFn: async () => {
      const [deptResult, perfResult] = await Promise.all([
        supabase.from("departments").select("id"),
        supabase.from("department_performance").select("overall_score").eq("period", "current")
      ]);
      const departments = deptResult.data || [];
      const performances = perfResult.data || [];
      const avgScore = performances.length > 0 ? performances.reduce((s, p) => s + (p.overall_score || 0), 0) / performances.length : 0;
      const topPerformers = performances.filter(p => (p.overall_score || 0) >= 75).length;
      const needsDev = performances.filter(p => (p.overall_score || 0) < 50).length;
      const { data: teams } = await supabase.from("teams").select("id");
      return { total: departments.length, teams: teams?.length || 0, avgScore, topPerformers, needsDev };
    }
  });

  const kpis = [
    { icon: Building2, label: "Abteilungen", value: data?.total || 0, subtitle: `${data?.teams || 0} Teams`, color: "purple" },
    { icon: TrendingUp, label: "Durchschnittsscore", value: Math.round(data?.avgScore || 0), subtitle: <PerformanceProgressBar value={data?.avgScore || 0} size="sm" showLabel={false} />, color: "blue" },
    { icon: ThumbsUp, label: "Top Performance", value: data?.topPerformers || 0, subtitle: "Abteilungen über 75", color: "green" },
    { icon: AlertTriangle, label: "Entwicklungsbedarf", value: data?.needsDev || 0, subtitle: "Abteilungen unter 50", color: "red" }
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
