import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentCard } from "./DepartmentCard";

export function DepartmentsList() {
  const { data: departmentPerformance, isLoading } = useQuery({
    queryKey: ["departments-list-company"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department_performance")
        .select(`
          id,
          overall_score,
          goals_score,
          tasks_score,
          feedback_score,
          development_score,
          trend,
          team_count,
          employee_count,
          overdue_reviews,
          department:departments(id, name)
        `)
        .eq("period", "current")
        .order("overall_score", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alle Abteilungen im Überblick</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!departmentPerformance || departmentPerformance.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alle Abteilungen im Überblick</h3>
        <div className="text-center py-8 text-muted-foreground">
          Keine Abteilungs-Performance-Daten vorhanden
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Alle Abteilungen im Überblick</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departmentPerformance.map((dp) => (
          <DepartmentCard
            key={dp.id}
            department={{
              id: dp.id,
              name: (dp.department as any)?.name || "Unbekannt",
              teamCount: dp.team_count || 0,
              employeeCount: dp.employee_count || 0,
              overdueReviews: dp.overdue_reviews || 0,
              trend: (dp.trend as "rising" | "falling" | "stable") || "stable",
              goalsScore: dp.goals_score || 0,
              tasksScore: dp.tasks_score || 0,
              feedbackScore: dp.feedback_score || 0,
              developmentScore: dp.development_score || 0,
              overallScore: dp.overall_score || 0
            }}
          />
        ))}
      </div>
    </div>
  );
}
