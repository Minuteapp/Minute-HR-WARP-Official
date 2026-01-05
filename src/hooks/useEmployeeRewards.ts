import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  EmployeeReward, 
  CreateEmployeeRewardRequest,
  EmployeeRewardStatus 
} from '@/types/reward-catalog';
import { toast } from 'sonner';

export const useEmployeeRewards = () => {
  return useQuery({
    queryKey: ['employee-rewards'],
    queryFn: async (): Promise<EmployeeReward[]> => {
      const { data, error } = await supabase
        .from('employee_rewards')
        .select('*')
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return (data || []) as EmployeeReward[];
    },
  });
};

export const useRecentEmployeeRewards = (limit: number = 10) => {
  return useQuery({
    queryKey: ['employee-rewards', 'recent', limit],
    queryFn: async (): Promise<EmployeeReward[]> => {
      const { data, error } = await supabase
        .from('employee_rewards')
        .select('*')
        .order('awarded_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as EmployeeReward[];
    },
  });
};

export const usePendingEmployeeRewards = () => {
  return useQuery({
    queryKey: ['employee-rewards', 'pending'],
    queryFn: async (): Promise<EmployeeReward[]> => {
      const { data, error } = await supabase
        .from('employee_rewards')
        .select('*')
        .eq('status', 'pending')
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return (data || []) as EmployeeReward[];
    },
  });
};

export const useCreateEmployeeReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateEmployeeRewardRequest): Promise<EmployeeReward> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('employee_rewards')
        .insert({
          ...request,
          awarded_by: user?.id,
          awarded_by_name: profile?.full_name || 'Unbekannt',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update redemption count in reward_catalog (best effort)
      if (request.reward_id) {
        const { data: currentReward } = await supabase
          .from('reward_catalog')
          .select('redemption_count')
          .eq('id', request.reward_id)
          .single();
        
        if (currentReward) {
          await supabase
            .from('reward_catalog')
            .update({ redemption_count: (currentReward.redemption_count || 0) + 1 })
            .eq('id', request.reward_id);
        }
      }

      return data as EmployeeReward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['reward-statistics'] });
      toast.success('Belohnung erfolgreich vergeben');
    },
    onError: (error) => {
      console.error('Error creating employee reward:', error);
      toast.error('Fehler beim Vergeben der Belohnung');
    },
  });
};

export const useUpdateEmployeeRewardStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: EmployeeRewardStatus;
    }): Promise<EmployeeReward> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates: Partial<EmployeeReward> = { status };
      
      if (status === 'approved') {
        updates.approved_by = user?.id;
        updates.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('employee_rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeReward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['reward-statistics'] });
      toast.success('Status erfolgreich aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    },
  });
};
