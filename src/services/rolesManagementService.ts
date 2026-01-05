import { supabase } from '@/integrations/supabase/client';

export const rolesManagementService = {
  // Alle Rollen mit Nachfolgestatus abrufen
  async getRolesWithSuccessionStatus() {
    const { data: units, error } = await supabase
      .from('organizational_units')
      .select(`
        *,
        manager:employees!organizational_units_manager_id_fkey(
          id, first_name, last_name
        ),
        parent:organizational_units!organizational_units_parent_id_fkey(
          name
        ),
        succession_plans:org_succession_plans(
          successor_candidates, risk_level
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return units?.map(unit => {
      const successionPlan = unit.succession_plans?.[0];
      const successors = (successionPlan?.successor_candidates as any[]) || [];
      const hasSuccession = successors.length > 0;
      const risk = successionPlan?.risk_level || 'low';

      let status: 'complete' | 'gap' | 'overlap' = 'complete';
      if (!hasSuccession && unit.manager) status = 'gap';
      if (successors.length > 3) status = 'overlap';

      return {
        id: unit.id,
        role: unit.name,
        department: unit.type,
        reportsTo: unit.parent?.name || '-',
        successors: successors.length,
        responsibilities: unit.description || '-',
        status,
        risk,
        managerName: unit.manager 
          ? `${unit.manager.first_name} ${unit.manager.last_name}`
          : 'Vakant'
      };
    }) || [];
  },

  // Statistiken berechnen
  async getRoleStatistics() {
    const roles = await this.getRolesWithSuccessionStatus();
    return {
      total: roles.length,
      complete: roles.filter(r => r.status === 'complete').length,
      gaps: roles.filter(r => r.status === 'gap').length,
      overlaps: roles.filter(r => r.status === 'overlap').length
    };
  }
};
