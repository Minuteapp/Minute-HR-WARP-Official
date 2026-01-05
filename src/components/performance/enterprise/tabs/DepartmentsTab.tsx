import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentsKPICards } from "../departments/DepartmentsKPICards";
import { DepartmentPerformanceCard } from "../departments/DepartmentPerformanceCard";

export function DepartmentsTab() {
  const { data: departmentPerformance, isLoading } = useQuery({
    queryKey: ["departments-tab-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("department_performance").select(`id, overall_score, goals_score, tasks_score, feedback_score, development_score, trend, team_count, employee_count, overdue_reviews, department:departments(id, name)`).eq("period", "current").order("overall_score", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="space-y-6">
      <DepartmentsKPICards />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Abteilungen</h3>
        {isLoading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}</div> 
        : !departmentPerformance?.length ? <div className="text-center py-8 text-muted-foreground">Keine Abteilungs-Performance-Daten vorhanden</div>
        : departmentPerformance.map(dp => <DepartmentPerformanceCard key={dp.id} department={{ id: dp.id, name: (dp.department as any)?.name || "Unbekannt", teamCount: dp.team_count || 0, employeeCount: dp.employee_count || 0, overdueReviews: dp.overdue_reviews || 0, trend: (dp.trend as any) || "stable", goalsScore: dp.goals_score || 0, tasksScore: dp.tasks_score || 0, feedbackScore: dp.feedback_score || 0, developmentScore: dp.development_score || 0, overallScore: dp.overall_score || 0 }} />)}
      </div>
    </div>
  );
}
