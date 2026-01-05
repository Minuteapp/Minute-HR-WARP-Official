import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';

export interface EmployeeGoal {
  id: string;
  employee_id: string;
  company_id?: string;
  goal_title: string;
  description?: string;
  category: 'personal' | 'team' | 'company' | 'skill' | 'performance' | 'development';
  type: 'okr' | 'kpi' | 'smart' | 'general';
  target_value?: number;
  current_value: number;
  unit?: string;
  target_date?: string;
  progress: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  created_by?: string;
  reviewed_by?: string;
  review_date?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  milestone_title: string;
  description?: string;
  target_date?: string;
  completed_date?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmployeeGoals = (employeeId: string) => {
  const queryClient = useQueryClient();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['employee-goals', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_goals')
        .select('*')
        .eq('employee_id', employeeId)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as EmployeeGoal[];
    },
    enabled: !!employeeId,
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['goal-milestones', employeeId],
    queryFn: async () => {
      const goalIds = goals.map(g => g.id);
      if (goalIds.length === 0) return [];

      const { data, error } = await supabase
        .from('goal_milestones')
        .select('*')
        .in('goal_id', goalIds)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as GoalMilestone[];
    },
    enabled: goals.length > 0,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Omit<EmployeeGoal, 'id' | 'created_at' | 'updated_at' | 'progress' | 'current_value'>) => {
      if (!companyId) throw new Error("Company ID fehlt - bitte neu laden");
      
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('employee_goals')
        .insert({
          ...goal,
          company_id: companyId,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-goals', employeeId] });
      toast.success('Ziel erstellt');
    },
    onError: (error: any) => {
      console.error('Error creating goal:', error);
      toast.error(`Fehler beim Erstellen des Ziels: ${error.message}`);
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<EmployeeGoal> }) => {
      const { data, error } = await supabase
        .from('employee_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-goals', employeeId] });
      toast.success('Ziel aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('employee_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-goals', employeeId] });
      toast.success('Ziel gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  const addMilestone = useMutation({
    mutationFn: async (milestone: Omit<GoalMilestone, 'id' | 'created_at' | 'updated_at' | 'is_completed'>) => {
      const { data, error } = await supabase
        .from('goal_milestones')
        .insert(milestone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', employeeId] });
      toast.success('Meilenstein hinzugefügt');
    },
    onError: (error) => {
      console.error('Error adding milestone:', error);
      toast.error('Fehler beim Hinzufügen');
    },
  });

  const completeMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data, error } = await supabase
        .from('goal_milestones')
        .update({
          is_completed: true,
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', employeeId] });
      toast.success('Meilenstein abgeschlossen');
    },
    onError: (error) => {
      console.error('Error completing milestone:', error);
      toast.error('Fehler beim Abschließen');
    },
  });

  const statistics = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    overdue: goals.filter(g => g.status === 'overdue').length,
    onTrack: goals.filter(g => g.status === 'active').length,
    atRisk: goals.filter(g => g.status === 'overdue').length,
    averageProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0,
    avgProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0,
  };

  return {
    goals,
    milestones,
    isLoading: isLoading || milestonesLoading,
    statistics,
    createGoal: createGoal.mutateAsync,
    updateGoal: updateGoal.mutateAsync,
    deleteGoal: deleteGoal.mutateAsync,
    addMilestone: addMilestone.mutateAsync,
    completeMilestone: completeMilestone.mutateAsync,
    updateProgress: updateGoal.mutateAsync,
  };
};
