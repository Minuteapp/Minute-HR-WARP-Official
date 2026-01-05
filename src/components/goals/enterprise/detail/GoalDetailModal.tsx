import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GoalDetailHeader } from "./GoalDetailHeader";
import { GoalStatCards } from "./GoalStatCards";
import { GoalInfoCards } from "./GoalInfoCards";
import { GoalProgressSection } from "./GoalProgressSection";
import { GoalKeyResultsSection } from "./GoalKeyResultsSection";
import { GoalHierarchySection } from "./GoalHierarchySection";
import { GoalProjectsSection } from "./GoalProjectsSection";
import { GoalDetailFooter } from "./GoalDetailFooter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoalDetailModalProps {
  goalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoalDetailModal = ({ goalId, open, onOpenChange }: GoalDetailModalProps) => {
  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal-detail', goalId],
    queryFn: async () => {
      if (!goalId) return null;
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!goalId && open
  });

  const { data: keyResults = [] } = useQuery({
    queryKey: ['goal-key-results', goalId],
    queryFn: async () => {
      if (!goalId) return [];
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('goal_id', goalId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!goalId && open
  });

  const { data: childGoals = [] } = useQuery({
    queryKey: ['goal-children', goalId],
    queryFn: async () => {
      if (!goalId) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select('id, title, progress')
        .eq('parent_goal_id', goalId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!goalId && open
  });

  const { data: parentGoal } = useQuery({
    queryKey: ['goal-parent', goal?.parent_goal_id],
    queryFn: async () => {
      if (!goal?.parent_goal_id) return null;
      
      const { data, error } = await supabase
        .from('goals')
        .select('id, title, progress')
        .eq('id', goal.parent_goal_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!goal?.parent_goal_id && open
  });

  const handleEdit = () => {
    toast.info("Bearbeiten-Funktion wird implementiert");
  };

  const handleArchive = async () => {
    if (!goalId) return;
    
    const { error } = await supabase
      .from('goals')
      .update({ status: 'archived' })
      .eq('id', goalId);
    
    if (error) {
      toast.error("Fehler beim Archivieren");
    } else {
      toast.success("Ziel archiviert");
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!goalId) return;
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);
    
    if (error) {
      toast.error("Fehler beim Löschen");
    } else {
      toast.success("Ziel gelöscht");
      onOpenChange(false);
    }
  };

  const handleGoalClick = (targetGoalId: string) => {
    // Would navigate to different goal - for now just log
    console.log('Navigate to goal:', targetGoalId);
  };

  if (isLoading || !goal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Laden...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            <GoalDetailHeader
              title={goal.title}
              description={goal.description}
              goalLevel={goal.goal_level || 'individual'}
              goalType={goal.goal_type || 'operational'}
              status={goal.status || 'on_track'}
            />

            <GoalStatCards
              progress={goal.progress || 0}
              targetProgress={goal.target_progress || 100}
              forecastProgress={goal.forecast_progress}
              riskLevel={goal.risk_level || 'low'}
            />

            <GoalInfoCards
              ownerName={goal.owner_name}
              departmentName={goal.department_name}
              startDate={goal.start_date}
              endDate={goal.end_date}
            />

            <GoalProgressSection
              progress={goal.progress || 0}
              targetProgress={goal.target_progress || 100}
            />

            <GoalKeyResultsSection keyResults={keyResults} />

            <GoalHierarchySection
              parentGoal={parentGoal || undefined}
              childGoals={childGoals}
              onGoalClick={handleGoalClick}
            />

            <GoalProjectsSection projects={[]} />

            <GoalDetailFooter
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
