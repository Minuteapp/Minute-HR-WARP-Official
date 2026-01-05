import { supabase } from '@/integrations/supabase/client';

export const successionPlanningService = {
  // Nachfolgepläne mit Kandidaten abrufen
  async getSuccessionPlans(filters?: { risk?: string }) {
    let query = supabase
      .from('org_succession_plans')
      .select(`
        *,
        unit:organizational_units(id, name, type),
        current_holder:employees!org_succession_plans_current_holder_id_fkey(
          id, first_name, last_name, position
        )
      `)
      .order('risk_level', { ascending: false });

    if (filters?.risk && filters.risk !== 'all') {
      query = query.eq('risk_level', filters.risk);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(plan => {
      const candidates = (plan.successor_candidates as any[]) || [];
      return {
        id: plan.id,
        position: plan.position_role,
        department: plan.unit?.name || '-',
        currentHolder: plan.current_holder 
          ? `${plan.current_holder.first_name} ${plan.current_holder.last_name}`
          : 'Vakant',
        successors: candidates.length,
        risk: plan.risk_level,
        isKeyPosition: plan.is_key_position,
        timeToReady: plan.time_to_ready,
        businessImpact: plan.business_impact,
        candidates: candidates.map((c: any) => ({
          id: c.employee_id,
          name: c.name,
          position: c.current_position,
          readiness: c.readiness_score,
          developmentPlan: c.development_plan || []
        }))
      };
    }) || [];
  },

  // Statistiken berechnen
  async getSuccessionStatistics() {
    const { data: plans, error } = await supabase
      .from('org_succession_plans')
      .select('risk_level, successor_candidates, is_key_position');

    if (error) throw error;

    const keyPositions = plans?.filter(p => p.is_key_position).length || 0;
    const highRisk = plans?.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length || 0;
    const criticalGaps = plans?.filter(p => {
      const candidates = (p.successor_candidates as any[]) || [];
      return p.risk_level === 'critical' && candidates.length === 0;
    }).length || 0;

    const avgReadiness = plans && plans.length > 0 ? plans.reduce((sum, p) => {
      const candidates = (p.successor_candidates as any[]) || [];
      const avgCandidateReadiness = candidates.length > 0
        ? candidates.reduce((s: number, c: any) => s + (c.readiness_score || 0), 0) / candidates.length
        : 0;
      return sum + avgCandidateReadiness;
    }, 0) / plans.length : 0;

    return {
      keyPositions,
      avgReadiness: Math.round(avgReadiness),
      highRisk,
      criticalGaps
    };
  }
};
