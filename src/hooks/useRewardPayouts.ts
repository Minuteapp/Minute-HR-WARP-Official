import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  RewardPayout, 
  PayoutStatistics, 
  PayoutStatus, 
  DistributionMethod 
} from '@/types/reward-payouts';
import { toast } from 'sonner';

export const useRewardPayouts = (statusFilter?: PayoutStatus | 'all') => {
  const queryClient = useQueryClient();

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ['reward-payouts', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('reward_payouts')
        .select(`
          *,
          profiles:employee_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('requested_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payouts:', error);
        return [];
      }

      return (data || []).map((payout: any) => ({
        ...payout,
        employee_name: payout.profiles?.full_name || payout.employee_name,
        employee_avatar: payout.profiles?.avatar_url,
      })) as RewardPayout[];
    },
  });

  const { data: statistics } = useQuery({
    queryKey: ['reward-payouts-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_payouts')
        .select('status');

      if (error) {
        console.error('Error fetching payout statistics:', error);
        return {
          pending: 0,
          inProgress: 0,
          delivered: 0,
          failed: 0,
          total: 0,
        };
      }

      const stats: PayoutStatistics = {
        pending: data.filter(p => p.status === 'pending').length,
        inProgress: data.filter(p => p.status === 'in_progress').length,
        delivered: data.filter(p => p.status === 'delivered').length,
        failed: data.filter(p => p.status === 'failed').length,
        total: data.length,
      };

      return stats;
    },
  });

  const { data: distributionMethods = [] } = useQuery({
    queryKey: ['distribution-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distribution_methods')
        .select('*')
        .order('method_name');

      if (error) {
        console.error('Error fetching distribution methods:', error);
        return [];
      }

      return data as DistributionMethod[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, deliveredAt }: { id: string; status: PayoutStatus; deliveredAt?: string }) => {
      const updateData: any = { status };
      if (deliveredAt) {
        updateData.delivered_at = deliveredAt;
      }

      const { error } = await supabase
        .from('reward_payouts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['reward-payouts-statistics'] });
      toast.success('Status aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating payout status:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const retryPayoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reward_payouts')
        .update({ 
          status: 'pending', 
          error_message: null 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['reward-payouts-statistics'] });
      toast.success('Auszahlung wird erneut versucht');
    },
    onError: (error) => {
      console.error('Error retrying payout:', error);
      toast.error('Fehler beim erneuten Versuch');
    },
  });

  const toggleMethodMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('distribution_methods')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-methods'] });
      toast.success('Methode aktualisiert');
    },
    onError: (error) => {
      console.error('Error toggling method:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  return {
    payouts,
    payoutsLoading,
    statistics: statistics || {
      pending: 0,
      inProgress: 0,
      delivered: 0,
      failed: 0,
      total: 0,
    },
    distributionMethods,
    updateStatus: updateStatusMutation.mutate,
    retryPayout: retryPayoutMutation.mutate,
    toggleMethod: toggleMethodMutation.mutate,
  };
};
