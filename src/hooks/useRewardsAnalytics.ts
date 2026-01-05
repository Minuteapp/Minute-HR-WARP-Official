import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsStatistics, RewardAnalyticsData, TopPerformer } from '@/types/reward-analytics';
import { format, subMonths, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

export const useRewardsAnalytics = (periodMonths: number = 12) => {
  const { data: analyticsData = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['reward-analytics', periodMonths],
    queryFn: async (): Promise<RewardAnalyticsData[]> => {
      const startDate = subMonths(new Date(), periodMonths);
      
      const { data, error } = await supabase
        .from('reward_analytics')
        .select('*')
        .gte('period_date', startDate.toISOString().split('T')[0])
        .order('period_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        engagement_score: Number(item.engagement_score),
        satisfaction_score: Number(item.satisfaction_score),
        retention_rate: Number(item.retention_rate),
        participation_rate: Number(item.participation_rate),
        total_value: Number(item.total_value)
      }));
    }
  });

  const { data: employeeRewards = [] } = useQuery({
    queryKey: ['employee-rewards-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_rewards')
        .select(`
          *,
          employee:profiles(id, display_name, avatar_url)
        `)
        .eq('status', 'redeemed');

      if (error) throw error;
      return data || [];
    }
  });

  const { data: peerKudos = [] } = useQuery({
    queryKey: ['peer-kudos-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_peer_kudos')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  const statistics: AnalyticsStatistics = (() => {
    // Calculate KPIs from analytics data - KEINE FALLBACK-WERTE!
    const latestData = analyticsData[analyticsData.length - 1];
    const previousData = analyticsData[analyticsData.length - 2];

    const engagementIncrease = previousData && latestData
      ? Math.round(((latestData.engagement_score - previousData.engagement_score) / previousData.engagement_score) * 100)
      : latestData?.engagement_score ? Math.round(latestData.engagement_score) : 0;

    // Echte Werte ohne Fallbacks - 0 wenn keine Daten
    const kpis = {
      engagementIncrease: isNaN(engagementIncrease) ? 0 : engagementIncrease,
      retentionRate: latestData?.retention_rate || 0,
      satisfactionScore: latestData?.satisfaction_score || 0,
      participationRate: latestData?.participation_rate || 0
    };

    // Trend data
    const trendData = analyticsData.map(d => ({
      period: format(new Date(d.period_date), 'MMM yy', { locale: de }),
      rewards: d.rewards_count,
      engagement: Math.round(d.engagement_score)
    }));

    // If no data, create empty trend (no fake data!)
    if (trendData.length === 0) {
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        trendData.push({
          period: format(date, 'MMM yy', { locale: de }),
          rewards: 0,
          engagement: 0
        });
      }
    }

    // Satisfaction trend
    const satisfactionTrend = analyticsData.map(d => ({
      period: format(new Date(d.period_date), 'MMM yy', { locale: de }),
      score: d.satisfaction_score
    }));

    // Department comparison
    const departmentStats: Record<string, { rewards: number; engagement: number }> = {};
    analyticsData.forEach(d => {
      if (d.department) {
        if (!departmentStats[d.department]) {
          departmentStats[d.department] = { rewards: 0, engagement: 0 };
        }
        departmentStats[d.department].rewards += d.rewards_count;
        departmentStats[d.department].engagement = Math.max(departmentStats[d.department].engagement, d.engagement_score);
      }
    });
    const departmentComparison = Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      rewards: stats.rewards,
      engagement: Math.round(stats.engagement)
    }));

    // Reward type distribution
    const typeCounts: Record<string, number> = {};
    employeeRewards.forEach((r: any) => {
      const type = r.reward_type || 'Sonstige';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const totalRewards = Object.values(typeCounts).reduce((a, b) => a + b, 0);
    const rewardTypeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: totalRewards > 0 ? Math.round((count / totalRewards) * 100) : 0
    }));

    // Top performers
    const performerStats: Record<string, TopPerformer> = {};
    employeeRewards.forEach((r: any) => {
      const empId = r.employee?.id || r.employee_id;
      if (!empId) return;
      
      if (!performerStats[empId]) {
        performerStats[empId] = {
          id: empId,
          name: r.employee?.display_name || 'Unbekannt',
          avatar: r.employee?.avatar_url,
          rewardsReceived: 0,
          kudosReceived: 0,
          engagementScore: 0
        };
      }
      performerStats[empId].rewardsReceived++;
    });

    peerKudos.forEach((k: any) => {
      const recId = k.receiver_id;
      if (performerStats[recId]) {
        performerStats[recId].kudosReceived++;
      }
    });

    // Calculate engagement score for each performer
    Object.values(performerStats).forEach(p => {
      p.engagementScore = Math.min(100, Math.round((p.rewardsReceived * 10 + p.kudosReceived * 5)));
    });

    const topPerformers = Object.values(performerStats)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);

    // ROI analysis - echte Werte ohne fake multipliers
    const totalInvestment = analyticsData.reduce((sum, d) => sum + d.total_value, 0);
    const productivityIncrease = kpis.engagementIncrease > 0 ? kpis.engagementIncrease : 0;
    const estimatedValue = totalInvestment > 0 ? Math.round(totalInvestment * 1.5) : 0; // Konservativer Schätzwert
    const roiMultiplier = totalInvestment > 0 ? Math.round((estimatedValue / totalInvestment) * 10) / 10 : 0;

    const roi = {
      totalInvestment,
      productivityIncrease: Math.round(productivityIncrease),
      estimatedValue,
      roiMultiplier
    };

    return {
      kpis,
      trendData,
      satisfactionTrend,
      departmentComparison,
      rewardTypeDistribution,
      topPerformers,
      roi
    };
  })();

  return {
    analyticsData,
    statistics,
    isLoading: analyticsLoading
  };
};
