import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RewardStatistics, RewardCategory } from '@/types/reward-catalog';
import { startOfMonth, subMonths, format } from 'date-fns';
import { de } from 'date-fns/locale';

export const useRewardStatistics = () => {
  return useQuery({
    queryKey: ['reward-statistics'],
    queryFn: async (): Promise<RewardStatistics> => {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now).toISOString();
      const startOfLastMonth = startOfMonth(subMonths(now, 1)).toISOString();

      // Get all employee rewards
      const { data: allRewards, error: rewardsError } = await supabase
        .from('employee_rewards')
        .select('*');

      if (rewardsError) throw rewardsError;

      // Get this month's rewards
      const { data: thisMonthRewards, error: thisMonthError } = await supabase
        .from('employee_rewards')
        .select('*')
        .gte('awarded_at', startOfCurrentMonth);

      if (thisMonthError) throw thisMonthError;

      // Get last month's rewards for comparison
      const { data: lastMonthRewards, error: lastMonthError } = await supabase
        .from('employee_rewards')
        .select('*')
        .gte('awarded_at', startOfLastMonth)
        .lt('awarded_at', startOfCurrentMonth);

      if (lastMonthError) throw lastMonthError;

      // Get catalog items
      const { data: catalogItems, error: catalogError } = await supabase
        .from('reward_catalog')
        .select('*');

      if (catalogError) throw catalogError;

      const rewards = allRewards || [];
      const thisMonth = thisMonthRewards || [];
      const lastMonth = lastMonthRewards || [];
      const catalog = catalogItems || [];

      // Calculate statistics
      const activeRewards = catalog.filter(c => c.is_active).length;
      const totalCatalogRewards = catalog.length;

      // Calculate budget
      const totalBudget = catalog.reduce((sum, c) => sum + (c.budget || 0), 0);
      const budgetUsed = catalog.reduce((sum, c) => sum + (c.budget_used || 0), 0);

      // Calculate change percentage
      const rewardsChange = lastMonth.length > 0 
        ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
        : thisMonth.length > 0 ? 100 : 0;

      // Get most popular reward
      const rewardCounts: Record<string, { name: string; count: number }> = {};
      rewards.forEach(r => {
        if (!rewardCounts[r.reward_name]) {
          rewardCounts[r.reward_name] = { name: r.reward_name, count: 0 };
        }
        rewardCounts[r.reward_name].count++;
      });
      const mostPopular = Object.values(rewardCounts).sort((a, b) => b.count - a.count)[0];

      // Calculate category distribution
      const categoryCounts: Record<RewardCategory, number> = {
        financial: 0,
        non_financial: 0,
        experience: 0,
        recognition: 0,
      };
      rewards.forEach(r => {
        const cat = r.category as RewardCategory;
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat]++;
        }
      });
      const totalCatCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
      const categoryDistribution = (Object.entries(categoryCounts) as [RewardCategory, number][]).map(
        ([category, count]) => ({
          category,
          count,
          percentage: totalCatCount > 0 ? Math.round((count / totalCatCount) * 100) : 0,
        })
      );

      // Calculate monthly data (last 6 months)
      const monthlyData: Array<{ month: string; count: number; value: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = startOfMonth(subMonths(now, i - 1));
        const monthRewards = rewards.filter(r => {
          const date = new Date(r.awarded_at);
          return date >= monthStart && date < monthEnd;
        });
        monthlyData.push({
          month: format(monthStart, 'MMM', { locale: de }),
          count: monthRewards.length,
          value: monthRewards.length * 100, // Placeholder value calculation
        });
      }

      // Get unique employees who received rewards
      const uniqueEmployees = new Set(rewards.map(r => r.employee_id));

      return {
        totalRewards: rewards.length,
        rewardsThisMonth: thisMonth.length,
        rewardsChange,
        budgetUsed,
        budgetTotal: totalBudget,
        budgetPercentage: totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0,
        participation: Math.min(uniqueEmployees.size * 10, 100), // Simplified calculation
        automatedRewards: rewards.filter(r => r.notes?.includes('automatisch')).length,
        activeRewards,
        totalCatalogRewards,
        redeemedThisMonth: thisMonth.length,
        redeemedChange: rewardsChange,
        mostPopular,
        monthlyData,
        categoryDistribution,
      };
    },
  });
};
