import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamsKPICards } from "../teams/TeamsKPICards";
import { TeamsFilterBar } from "../teams/TeamsFilterBar";
import { TeamPerformanceCard } from "../teams/TeamPerformanceCard";

export function TeamsTab() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("score_desc");

  const { data: teamPerformance, isLoading } = useQuery({
    queryKey: ["teams-tab-list", department, sortBy],
    queryFn: async () => {
      let query = supabase.from("team_performance").select(`id, overall_score, goals_score, tasks_score, feedback_score, development_score, trend, employee_count, overdue_reviews, total_goals, total_tasks, total_feedback_items, total_development_actions, team:teams(id, name), department:departments(id, name)`).eq("period", "current");
      if (department !== "all") query = query.eq("department_id", department);
      if (sortBy === "score_desc") query = query.order("overall_score", { ascending: false });
      else if (sortBy === "score_asc") query = query.order("overall_score", { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const filtered = teamPerformance?.filter(tp => {
    if (!search) return true;
    const teamName = ((tp.team as any)?.name || "").toLowerCase();
    const deptName = ((tp.department as any)?.name || "").toLowerCase();
    return teamName.includes(search.toLowerCase()) || deptName.includes(search.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      <TeamsKPICards />
      <TeamsFilterBar search={search} setSearch={setSearch} department={department} setDepartment={setDepartment} sortBy={sortBy} setSortBy={setSortBy} />
      <div className="space-y-4">
        {isLoading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}</div>
        : !filtered.length ? <div className="text-center py-8 text-muted-foreground">Keine Team-Performance-Daten vorhanden</div>
        : filtered.map(tp => <TeamPerformanceCard key={tp.id} team={{ id: tp.id, name: (tp.team as any)?.name || "Unbekannt", departmentName: (tp.department as any)?.name || "", employeeCount: tp.employee_count || 0, overdueReviews: tp.overdue_reviews || 0, trend: (tp.trend as any) || "stable", goalsScore: tp.goals_score || 0, tasksScore: tp.tasks_score || 0, feedbackScore: tp.feedback_score || 0, developmentScore: tp.development_score || 0, overallScore: tp.overall_score || 0, totalGoals: tp.total_goals || 0, totalTasks: tp.total_tasks || 0, totalFeedback: tp.total_feedback_items || 0, totalDevelopment: tp.total_development_actions || 0 }} />)}
      </div>
    </div>
  );
}
