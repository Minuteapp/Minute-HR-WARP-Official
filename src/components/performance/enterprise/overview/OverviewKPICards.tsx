import { Card, CardContent } from "@/components/ui/card";
import { Target, Clock, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function OverviewKPICards() {
  const { data: performanceData } = useQuery({
    queryKey: ["performance-overview-kpis"],
    queryFn: async () => {
      const [cyclesResult, goalsResult, employeesResult] = await Promise.all([
        supabase.from("performance_reviews").select("id, status"),
        supabase.from("goals").select("id, progress, status"),
        supabase.from("employees").select("id")
      ]);

      const cycles = cyclesResult.data || [];
      const goals = goalsResult.data || [];
      const employees = employeesResult.data || [];

      const activeCycles = cycles.filter(c => c.status === "active" || c.status === "pending").length;
      const reviewsDue = cycles.filter(c => c.status === "pending").length;
      const avgGoalProgress = goals.length > 0 
        ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length 
        : 0;
      const criticalCases = cycles.filter(c => c.status === "overdue").length;

      return {
        activeCycles,
        totalCycles: cycles.length,
        reviewsDue,
        avgGoalProgress,
        totalGoals: goals.length,
        feedbackRate: 60,
        totalEmployees: employees.length,
        criticalCases
      };
    }
  });

  const kpis = [
    {
      icon: Target,
      label: "Aktive Performance-Zyklen",
      value: performanceData?.activeCycles || 0,
      subtitle: `${performanceData?.totalCycles || 0} gesamt`,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Clock,
      label: "Reviews fällig",
      value: performanceData?.reviewsDue || 0,
      subtitle: "Erfordern Aufmerksamkeit",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: TrendingUp,
      label: "Ø Zielerreichung",
      value: `${Math.round(performanceData?.avgGoalProgress || 0)}%`,
      subtitle: `${performanceData?.totalGoals || 0} Ziele`,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Users,
      label: "Feedback-Beteiligung",
      value: `${performanceData?.feedbackRate || 0}%`,
      subtitle: `${performanceData?.totalEmployees || 0} Mitarbeitende`,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: AlertTriangle,
      label: "Kritische Fälle",
      value: performanceData?.criticalCases || 0,
      subtitle: "Erfordert Aufmerksamkeit",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
