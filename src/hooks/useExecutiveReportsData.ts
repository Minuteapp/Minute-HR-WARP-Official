import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useExecutiveReportsData = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Aktive Mitarbeiter (Headcount)
  const { data: headcount = 0, isLoading: headcountLoading } = useQuery({
    queryKey: ['executive-headcount', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Headcount Trend (Vergleich zum Vormonat)
  const { data: headcountTrend = 0, isLoading: trendLoading } = useQuery({
    queryKey: ['executive-headcount-trend', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Neueinstellungen
      const { count: newHires } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('hire_date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      // Abgänge
      const { count: terminations } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'inactive')
        .gte('termination_date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      return (newHires || 0) - (terminations || 0);
    },
    enabled: !!companyId,
  });

  // Neueinstellungen (letzte 30 Tage)
  const { data: newHires = 0, isLoading: newHiresLoading } = useQuery({
    queryKey: ['executive-new-hires', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('hire_date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Abgänge (letzte 12 Monate)
  const { data: terminations = 0, isLoading: terminationsLoading } = useQuery({
    queryKey: ['executive-terminations', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'inactive')
        .gte('termination_date', oneYearAgo.toISOString().split('T')[0]);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Fluktuationsrate berechnen
  const fluctuationRate = headcount > 0 
    ? Math.round((terminations / headcount) * 100 * 10) / 10 
    : 0;

  // Time-to-Hire (aus job_applications)
  const { data: timeToHire = 0, isLoading: timeToHireLoading } = useQuery({
    queryKey: ['executive-time-to-hire', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('created_at, hired_at')
        .eq('company_id', companyId)
        .eq('status', 'hired')
        .not('hired_at', 'is', null);
      
      if (error || !data || data.length === 0) return 0;
      
      // Berechne durchschnittliche Tage
      let totalDays = 0;
      let validEntries = 0;
      
      data.forEach(app => {
        if (app.hired_at && app.created_at) {
          const start = new Date(app.created_at);
          const end = new Date(app.hired_at);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            totalDays += days;
            validEntries++;
          }
        }
      });
      
      return validEntries > 0 ? Math.round(totalDays / validEntries) : 0;
    },
    enabled: !!companyId,
  });

  // Zielerreichung (aus performance_reviews)
  const { data: goalAchievement = 0, isLoading: goalLoading } = useQuery({
    queryKey: ['executive-goal-achievement', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      const { data, error } = await supabase
        .from('performance_reviews')
        .select('overall_rating')
        .eq('company_id', companyId)
        .not('overall_rating', 'is', null);
      
      if (error || !data || data.length === 0) return 0;
      
      // Durchschnitt berechnen (assuming rating is 1-5 scale, convert to percentage)
      const totalRating = data.reduce((sum, review) => sum + (review.overall_rating || 0), 0);
      const avgRating = totalRating / data.length;
      
      // Convert to percentage (1-5 scale to 0-100%)
      return Math.round((avgRating / 5) * 100);
    },
    enabled: !!companyId,
  });

  // Krankenstand (letzte 30 Tage)
  const { data: sickLeaveRate = 0, isLoading: sickLeaveLoading } = useQuery({
    queryKey: ['executive-sick-leave', companyId],
    queryFn: async () => {
      if (!companyId || headcount === 0) return 0;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from('sick_leaves')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('start_date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Berechne Rate
      return Math.round(((count || 0) / headcount) * 100 * 10) / 10;
    },
    enabled: !!companyId && headcount > 0,
  });

  const isLoading = headcountLoading || trendLoading || newHiresLoading || 
                    terminationsLoading || timeToHireLoading || goalLoading || sickLeaveLoading;

  return {
    headcount,
    headcountTrend,
    newHires,
    terminations,
    fluctuationRate,
    timeToHire,
    goalAchievement,
    sickLeaveRate,
    isLoading,
    companyId
  };
};
