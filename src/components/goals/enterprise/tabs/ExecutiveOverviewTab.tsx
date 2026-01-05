import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExecutiveFilters } from "../executive/ExecutiveFilters";
import { ExecutiveKPICards } from "../executive/ExecutiveKPICards";
import { ExecutiveAISummary } from "../executive/ExecutiveAISummary";
import { GoalsTable } from "../executive/GoalsTable";
import { GoalDetailModal } from "../detail/GoalDetailModal";

export const ExecutiveOverviewTab = () => {
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { data: goals = [] } = useQuery({
    queryKey: ['enterprise-goals', levelFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (levelFilter !== 'all') {
        query = query.eq('goal_level', levelFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('goal_type', typeFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Calculate KPIs
  const companyGoals = goals.filter(g => g.goal_level === 'company').length;
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) 
    : 0;
  const criticalCount = goals.filter(g => g.risk_level === 'high').length;
  const delayedCount = goals.filter(g => g.status === 'at_risk' || g.status === 'delayed').length;
  const unlinkedCount = goals.filter(g => !g.parent_goal_id && g.goal_level !== 'company').length;

  const handleGoalClick = (goal: any) => {
    setSelectedGoalId(goal.id);
  };

  return (
    <div className="space-y-6">
      <ExecutiveFilters
        levelFilter={levelFilter}
        typeFilter={typeFilter}
        onLevelChange={setLevelFilter}
        onTypeChange={setTypeFilter}
      />

      <ExecutiveKPICards
        companyGoals={companyGoals}
        avgProgress={avgProgress}
        criticalCount={criticalCount}
        delayedCount={delayedCount}
        unlinkedCount={unlinkedCount}
      />

      <ExecutiveAISummary />

      <GoalsTable 
        goals={goals.map(g => ({
          id: g.id,
          title: g.title,
          goal_level: g.goal_level || 'individual',
          owner_name: g.owner_name,
          status: g.status || 'on_track',
          progress: g.progress || 0,
          trend: g.trend || 'stable',
          risk_level: g.risk_level || 'low'
        }))} 
        onGoalClick={handleGoalClick}
      />

      <GoalDetailModal
        goalId={selectedGoalId}
        open={!!selectedGoalId}
        onOpenChange={(open) => !open && setSelectedGoalId(null)}
      />
    </div>
  );
};
