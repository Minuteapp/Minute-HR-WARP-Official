import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ModuleAchievement, ModuleAchievementStatistics } from '@/types/incentive-rules';

export const useModuleAchievements = (moduleFilter?: string) => {
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading, error } = useQuery({
    queryKey: ['module-achievements', moduleFilter],
    queryFn: async (): Promise<ModuleAchievement[]> => {
      let query = supabase
        .from('module_achievements')
        .select(`
          *,
          employee:profiles!module_achievements_employee_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (moduleFilter && moduleFilter !== 'all') {
        query = query.eq('source_module', moduleFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ModuleAchievement[];
    }
  });

  const { data: statistics } = useQuery({
    queryKey: ['module-achievements-statistics'],
    queryFn: async (): Promise<ModuleAchievementStatistics> => {
      const { data, error } = await supabase
        .from('module_achievements')
        .select('*');

      if (error) throw error;

      const allAchievements = (data || []) as ModuleAchievement[];
      const pendingCount = allAchievements.filter(a => a.status === 'pending').length;
      const approvedCount = allAchievements.filter(a => a.status === 'approved').length;
      const completedCount = allAchievements.filter(a => a.status === 'completed').length;
      
      const scoresWithValue = allAchievements.filter(a => a.ai_score !== null);
      const avgAiScore = scoresWithValue.length > 0 
        ? Math.round(scoresWithValue.reduce((sum, a) => sum + (a.ai_score || 0), 0) / scoresWithValue.length)
        : 0;

      const byModule: Record<string, number> = {};
      allAchievements.forEach(a => {
        byModule[a.source_module] = (byModule[a.source_module] || 0) + 1;
      });

      return {
        totalAchievements: allAchievements.length,
        pendingCount,
        approvedCount,
        completedCount,
        avgAiScore,
        byModule
      };
    }
  });

  const { data: moduleStats } = useQuery({
    queryKey: ['module-achievements-by-module'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_achievements')
        .select('source_module, impact_level');

      if (error) throw error;

      const modules = ['performance', 'goals_okrs', 'tasks', 'shifts', 'surveys'];
      const stats: Record<string, { count: number; highImpact: number }> = {};
      
      modules.forEach(m => {
        stats[m] = { count: 0, highImpact: 0 };
      });

      (data || []).forEach((a: any) => {
        if (stats[a.source_module]) {
          stats[a.source_module].count++;
          if (a.impact_level === 'high') {
            stats[a.source_module].highImpact++;
          }
        }
      });

      return stats;
    }
  });

  const updateAchievementStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ModuleAchievement['status'] }) => {
      const updates: any = { status };
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('module_achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['module-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['module-achievements-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['module-achievements-by-module'] });
      
      const statusMessages: Record<string, string> = {
        approved: 'Achievement genehmigt',
        rejected: 'Achievement abgelehnt',
        completed: 'Belohnung ausgegeben'
      };
      toast.success(statusMessages[variables.status] || 'Status aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating achievement:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  });

  return {
    achievements,
    isLoading,
    error,
    statistics,
    moduleStats,
    updateAchievementStatus
  };
};
