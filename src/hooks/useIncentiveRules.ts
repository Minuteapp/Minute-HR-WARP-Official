import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { IncentiveRule, CreateIncentiveRuleRequest, IncentiveRuleStatistics } from '@/types/incentive-rules';

export const useIncentiveRules = () => {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['incentive-rules'],
    queryFn: async (): Promise<IncentiveRule[]> => {
      const { data, error } = await supabase
        .from('incentive_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as IncentiveRule[];
    }
  });

  const { data: statistics } = useQuery({
    queryKey: ['incentive-rules-statistics'],
    queryFn: async (): Promise<IncentiveRuleStatistics> => {
      const { data, error } = await supabase
        .from('incentive_rules')
        .select('*');

      if (error) throw error;

      const allRules = (data || []) as IncentiveRule[];
      const activeRules = allRules.filter(r => r.is_active);
      const automaticRules = allRules.filter(r => r.is_automatic);
      const totalExecutions = allRules.reduce((sum, r) => sum + (r.execution_count || 0), 0);
      const budgetTotal = allRules.reduce((sum, r) => sum + (r.budget || 0), 0);
      const budgetUsed = allRules.reduce((sum, r) => sum + (r.budget_used || 0), 0);

      return {
        totalRules: allRules.length,
        activeRules: activeRules.length,
        totalExecutions,
        automatedPercentage: allRules.length > 0 ? Math.round((automaticRules.length / allRules.length) * 100) : 0,
        budgetTotal,
        budgetUsed
      };
    }
  });

  const createRule = useMutation({
    mutationFn: async (request: CreateIncentiveRuleRequest) => {
      const { data, error } = await supabase
        .from('incentive_rules')
        .insert({
          name: request.name,
          category: request.category,
          trigger_description: request.trigger_description,
          trigger_conditions: request.trigger_conditions || [],
          conditions_count: request.conditions_count || 0,
          action_description: request.action_description,
          action_frequency: request.action_frequency || null,
          reward_id: request.reward_id || null,
          is_automatic: request.is_automatic ?? true,
          is_active: request.is_active ?? true,
          budget: request.budget || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-rules'] });
      queryClient.invalidateQueries({ queryKey: ['incentive-rules-statistics'] });
      toast.success('Regel erfolgreich erstellt');
    },
    onError: (error) => {
      console.error('Error creating rule:', error);
      toast.error('Fehler beim Erstellen der Regel');
    }
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IncentiveRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('incentive_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-rules'] });
      queryClient.invalidateQueries({ queryKey: ['incentive-rules-statistics'] });
      toast.success('Regel erfolgreich aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating rule:', error);
      toast.error('Fehler beim Aktualisieren der Regel');
    }
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('incentive_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incentive-rules'] });
      queryClient.invalidateQueries({ queryKey: ['incentive-rules-statistics'] });
      toast.success('Regel erfolgreich gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting rule:', error);
      toast.error('Fehler beim Löschen der Regel');
    }
  });

  const toggleRuleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('incentive_rules')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incentive-rules'] });
      queryClient.invalidateQueries({ queryKey: ['incentive-rules-statistics'] });
      toast.success(variables.is_active ? 'Regel aktiviert' : 'Regel pausiert');
    },
    onError: (error) => {
      console.error('Error toggling rule:', error);
      toast.error('Fehler beim Ändern des Status');
    }
  });

  return {
    rules,
    isLoading,
    error,
    statistics,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleActive
  };
};
