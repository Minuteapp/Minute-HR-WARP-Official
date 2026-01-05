import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HierarchyInfoBox } from "../hierarchy/HierarchyInfoBox";
import { HierarchyList } from "../hierarchy/HierarchyList";
import { GoalDetailModal } from "../detail/GoalDetailModal";

export const GoalHierarchyTab = () => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { data: goals = [] } = useQuery({
    queryKey: ['hierarchy-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('goal_level', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleGoalClick = (goal: any) => {
    setSelectedGoalId(goal.id);
  };

  return (
    <div className="space-y-6">
      <HierarchyInfoBox />

      <HierarchyList 
        goals={goals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          goal_level: g.goal_level || 'individual',
          goal_type: g.goal_type || 'operational',
          status: g.status || 'on_track',
          progress: g.progress || 0,
          owner_name: g.owner_name,
          department_name: g.department_name,
          is_employee_goal: g.is_employee_goal,
          parent_goal_id: g.parent_goal_id,
          key_results: []
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
