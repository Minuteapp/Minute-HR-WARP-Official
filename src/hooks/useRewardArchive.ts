import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  RewardArchiveItem, 
  ArchiveStatistics, 
  ArchiveFilters 
} from '@/types/reward-archive';

export const useRewardArchive = (filters: ArchiveFilters = {}) => {
  const { data: archiveItems = [], isLoading } = useQuery({
    queryKey: ['reward-archive', filters],
    queryFn: async () => {
      let query = supabase
        .from('reward_archive')
        .select(`
          *,
          profiles:employee_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('archive_date', { ascending: false });

      if (filters.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('archive_date', startDate).lte('archive_date', endDate);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`reward_name.ilike.%${filters.search}%,employee_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching archive:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        ...item,
        employee_name: item.profiles?.full_name || item.employee_name,
        employee_avatar: item.profiles?.avatar_url,
      })) as RewardArchiveItem[];
    },
  });

  const { data: statistics } = useQuery({
    queryKey: ['reward-archive-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_archive')
        .select('*');

      if (error) {
        console.error('Error fetching archive statistics:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return {
          totalRewards: 0,
          totalValue: 0,
          avgPerEmployee: 0,
          mostFrequent: { name: '-', count: 0 },
          yearlyBreakdown: [],
          categoryDistribution: [],
        } as ArchiveStatistics;
      }

      // Berechne Statistiken
      const totalRewards = data.length;
      const totalValue = data.reduce((sum, item) => sum + (item.value_amount || 0), 0);
      
      // Eindeutige Mitarbeiter
      const uniqueEmployees = new Set(data.map(item => item.employee_id).filter(Boolean));
      const avgPerEmployee = uniqueEmployees.size > 0 ? totalValue / uniqueEmployees.size : 0;

      // Häufigste Belohnung
      const rewardCounts: Record<string, number> = {};
      data.forEach(item => {
        rewardCounts[item.reward_name] = (rewardCounts[item.reward_name] || 0) + 1;
      });
      const mostFrequentName = Object.entries(rewardCounts)
        .sort((a, b) => b[1] - a[1])[0];

      // Jahres-Breakdown
      const yearlyData: Record<number, { count: number; value: number }> = {};
      data.forEach(item => {
        const year = new Date(item.archive_date).getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = { count: 0, value: 0 };
        }
        yearlyData[year].count++;
        yearlyData[year].value += item.value_amount || 0;
      });

      // Kategorie-Verteilung
      const categoryCounts: Record<string, number> = {};
      data.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });

      const stats: ArchiveStatistics = {
        totalRewards,
        totalValue,
        avgPerEmployee: Math.round(avgPerEmployee),
        mostFrequent: {
          name: mostFrequentName?.[0] || '-',
          count: mostFrequentName?.[1] || 0,
        },
        yearlyBreakdown: Object.entries(yearlyData)
          .map(([year, data]) => ({
            year: parseInt(year),
            count: data.count,
            value: data.value,
          }))
          .sort((a, b) => b.year - a.year),
        categoryDistribution: Object.entries(categoryCounts)
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / totalRewards) * 100),
          }))
          .sort((a, b) => b.count - a.count),
      };

      return stats;
    },
  });

  const { data: availableYears = [] } = useQuery({
    queryKey: ['reward-archive-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_archive')
        .select('archive_date');

      if (error || !data) return [];

      const years = [...new Set(
        data.map(item => new Date(item.archive_date).getFullYear())
      )].sort((a, b) => b - a);

      return years;
    },
  });

  const { data: availableCategories = [] } = useQuery({
    queryKey: ['reward-archive-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_archive')
        .select('category');

      if (error || !data) return [];

      return [...new Set(data.map(item => item.category))].sort();
    },
  });

  const exportToCSV = () => {
    if (archiveItems.length === 0) {
      return;
    }

    const headers = ['Datum', 'Mitarbeiter', 'Belohnung', 'Wert', 'Kategorie', 'Abteilung', 'Genehmigt von'];
    const rows = archiveItems.map(item => [
      new Date(item.archive_date).toLocaleDateString('de-DE'),
      item.employee_name || '',
      item.reward_name,
      item.value_display,
      item.category,
      item.department || '',
      item.approved_by || '',
    ]);

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `belohnungen_archiv_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return {
    archiveItems,
    isLoading,
    statistics: statistics || {
      totalRewards: 0,
      totalValue: 0,
      avgPerEmployee: 0,
      mostFrequent: { name: '-', count: 0 },
      yearlyBreakdown: [],
      categoryDistribution: [],
    },
    availableYears,
    availableCategories,
    exportToCSV,
  };
};
