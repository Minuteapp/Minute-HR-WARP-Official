import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePerformanceRealData = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Feedback-Anzahl (letzte 30 Tage)
  const { data: feedbackCount = 0, isLoading: feedbackLoading } = useQuery({
    queryKey: ['performance-feedback-count', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from('continuous_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Entwicklungspläne
  const { data: developmentPlansCount = 0, isLoading: plansLoading } = useQuery({
    queryKey: ['performance-development-plans', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { count, error } = await supabase
        .from('development_plans')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Durchschnittsbewertung
  const { data: averageRating = 0, isLoading: ratingLoading } = useQuery({
    queryKey: ['performance-average-rating', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { data, error } = await supabase
        .from('performance_reviews')
        .select('overall_rating')
        .eq('company_id', companyId)
        .eq('status', 'completed')
        .not('overall_rating', 'is', null);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const sum = data.reduce((acc, review) => acc + (review.overall_rating || 0), 0);
        return Math.round((sum / data.length) * 10) / 10;
      }
      return 0;
    },
    enabled: !!companyId,
  });

  // Review-Abschlussrate
  const { data: completionRate = 0, isLoading: completionLoading } = useQuery({
    queryKey: ['performance-completion-rate', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { count: totalCount } = await supabase
        .from('performance_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      
      const { count: completedCount } = await supabase
        .from('performance_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'completed');
      
      if (totalCount && totalCount > 0) {
        return Math.round((completedCount || 0) / totalCount * 100);
      }
      return 0;
    },
    enabled: !!companyId,
  });

  // Ziel-Erreichung
  const { data: goalAchievement = 0, isLoading: goalLoading } = useQuery({
    queryKey: ['performance-goal-achievement', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { data, error } = await supabase
        .from('goals')
        .select('progress')
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const avgProgress = data.reduce((acc, goal) => acc + (goal.progress || 0), 0) / data.length;
        return Math.round(avgProgress);
      }
      return 0;
    },
    enabled: !!companyId,
  });

  // Aktive Zyklen
  const { data: activeCyclesCount = 0, isLoading: cyclesLoading } = useQuery({
    queryKey: ['performance-active-cycles', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { count, error } = await supabase
        .from('performance_cycles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  const isLoading = feedbackLoading || plansLoading || ratingLoading || completionLoading || goalLoading || cyclesLoading;

  return {
    feedbackCount,
    developmentPlansCount,
    averageRating,
    completionRate,
    goalAchievement,
    activeCyclesCount,
    isLoading,
    companyId
  };
};
