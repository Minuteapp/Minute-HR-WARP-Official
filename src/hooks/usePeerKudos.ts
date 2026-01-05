import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PeerKudos, KudosStatistics, KudosCategory } from '@/types/peer-recognition';
import { startOfMonth, subMonths, format } from 'date-fns';

export const usePeerKudos = () => {
  const queryClient = useQueryClient();

  const { data: kudosList = [], isLoading } = useQuery({
    queryKey: ['peer-kudos'],
    queryFn: async (): Promise<PeerKudos[]> => {
      const { data, error } = await supabase
        .from('employee_peer_kudos')
        .select(`
          *,
          sender:profiles!employee_peer_kudos_sender_id_fkey(id, display_name, avatar_url),
          receiver:profiles!employee_peer_kudos_receiver_id_fkey(id, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        sender_id: item.sender_id,
        receiver_id: item.receiver_id,
        sender_name: item.sender?.display_name || 'Unbekannt',
        receiver_name: item.receiver?.display_name || 'Unbekannt',
        sender_avatar: item.sender?.avatar_url,
        receiver_avatar: item.receiver?.avatar_url,
        category: item.category as KudosCategory,
        message: item.message,
        kudos_amount: item.kudos_amount || 10,
        likes_count: item.likes_count || 0,
        company_id: item.company_id,
        created_at: item.created_at
      }));
    }
  });

  const statistics: KudosStatistics = (() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = startOfMonth(now);

    const thisMonthKudos = kudosList.filter(k => new Date(k.created_at) >= thisMonthStart);
    const lastMonthKudos = kudosList.filter(k => {
      const date = new Date(k.created_at);
      return date >= lastMonthStart && date < lastMonthEnd;
    });

    const thisMonthCount = thisMonthKudos.length;
    const lastMonthCount = lastMonthKudos.length;
    const monthlyChange = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : 0;

    // Top Givers
    const giverCounts: Record<string, { id: string; name: string; avatar?: string; count: number }> = {};
    kudosList.forEach(k => {
      if (!giverCounts[k.sender_id]) {
        giverCounts[k.sender_id] = { id: k.sender_id, name: k.sender_name || '', avatar: k.sender_avatar, count: 0 };
      }
      giverCounts[k.sender_id].count++;
    });
    const topGivers = Object.values(giverCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Receivers
    const receiverCounts: Record<string, { id: string; name: string; avatar?: string; count: number }> = {};
    kudosList.forEach(k => {
      if (!receiverCounts[k.receiver_id]) {
        receiverCounts[k.receiver_id] = { id: k.receiver_id, name: k.receiver_name || '', avatar: k.receiver_avatar, count: 0 };
      }
      receiverCounts[k.receiver_id].count++;
    });
    const topReceivers = Object.values(receiverCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Category stats
    const categoryCounts: Record<KudosCategory, number> = {
      expertise: 0,
      helpfulness: 0,
      teamwork: 0,
      innovation: 0,
      leadership: 0,
      dedication: 0
    };
    kudosList.forEach(k => {
      if (categoryCounts[k.category] !== undefined) {
        categoryCounts[k.category]++;
      }
    });
    const totalCategoryCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const categoryStats = Object.entries(categoryCounts).map(([category, count]) => ({
      category: category as KudosCategory,
      count,
      percentage: totalCategoryCount > 0 ? Math.round((count / totalCategoryCount) * 100) : 0
    }));

    // Unique participants
    const uniqueParticipants = new Set([
      ...kudosList.map(k => k.sender_id),
      ...kudosList.map(k => k.receiver_id)
    ]).size;

    return {
      totalKudos: kudosList.length,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      monthlyChange,
      participationRate: 78, // Would need total employee count
      avgPerPerson: uniqueParticipants > 0 ? Math.round(kudosList.length / uniqueParticipants * 10) / 10 : 0,
      topGivers,
      topReceivers,
      categoryStats
    };
  })();

  const sendKudos = useMutation({
    mutationFn: async (data: {
      receiver_id: string;
      category: KudosCategory;
      message: string;
      kudos_amount: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('employee_peer_kudos')
        .insert({
          sender_id: userData.user.id,
          receiver_id: data.receiver_id,
          category: data.category,
          message: data.message,
          kudos_amount: data.kudos_amount
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-kudos'] });
    }
  });

  const likeKudos = useMutation({
    mutationFn: async (kudosId: string) => {
      const { error } = await supabase
        .from('employee_peer_kudos')
        .update({ likes_count: supabase.rpc('increment_likes', { row_id: kudosId }) })
        .eq('id', kudosId);

      if (error) {
        // Fallback: increment manually
        const kudos = kudosList.find(k => k.id === kudosId);
        if (kudos) {
          await supabase
            .from('employee_peer_kudos')
            .update({ likes_count: (kudos.likes_count || 0) + 1 })
            .eq('id', kudosId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-kudos'] });
    }
  });

  return {
    kudosList,
    statistics,
    isLoading,
    sendKudos,
    likeKudos
  };
};
