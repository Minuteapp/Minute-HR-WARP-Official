import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PulseKPIs {
  engagementScore: number;
  participationRate: number;
  moodTrend: 'positive' | 'neutral' | 'negative';
  psychologicalBurden: number;
  turnoverRisk: number;
  activeSurveys: number;
  totalEmployees: number;
  respondents: number;
}

export const usePulseKPIs = () => {
  return useQuery({
    queryKey: ['pulse-kpis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id, company_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole) throw new Error('No tenant found');

      // Get active surveys count
      const { data: surveys, error: surveysError } = await supabase
        .from('pulse_surveys')
        .select('id')
        .eq('tenant_id', userRole.tenant_id)
        .eq('status', 'active');

      if (surveysError) throw surveysError;

      // Get latest analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('pulse_survey_analytics')
        .select('*')
        .eq('tenant_id', userRole.tenant_id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analyticsError) throw analyticsError;

      // Get previous analytics for trend calculation
      const { data: previousAnalytics } = await supabase
        .from('pulse_survey_analytics')
        .select('engagement_score')
        .eq('tenant_id', userRole.tenant_id)
        .order('calculated_at', { ascending: false })
        .range(1, 1)
        .maybeSingle();

      // Get total unique respondents
      const { data: responses, error: responsesError } = await supabase
        .from('pulse_survey_responses')
        .select('respondent_id')
        .eq('tenant_id', userRole.tenant_id);

      if (responsesError) throw responsesError;

      const uniqueRespondents = new Set(responses?.map(r => r.respondent_id) || []).size;

      // Get total employees
      const { count: employeesCount, error: employeesError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .neq('archived', true);

      if (employeesError) throw employeesError;

      // Calculate mood trend
      let moodTrend: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (analytics && previousAnalytics) {
        const diff = (analytics.engagement_score || 0) - (previousAnalytics.engagement_score || 0);
        if (diff > 2) moodTrend = 'positive';
        else if (diff < -2) moodTrend = 'negative';
      } else if (analytics?.engagement_score) {
        if (analytics.engagement_score > 70) moodTrend = 'positive';
        else if (analytics.engagement_score < 50) moodTrend = 'negative';
      }

      const kpis: PulseKPIs = {
        engagementScore: analytics?.engagement_score || 0,
        participationRate: analytics?.participation_rate || 0,
        moodTrend,
        psychologicalBurden: analytics?.psychological_burden_index || 0,
        turnoverRisk: analytics?.turnover_risk_score || 0,
        activeSurveys: surveys?.length || 0,
        totalEmployees: employeesCount || 0,
        respondents: uniqueRespondents,
      };

      return kpis;
    },
  });
};
