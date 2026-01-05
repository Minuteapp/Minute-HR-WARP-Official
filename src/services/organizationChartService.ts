import { supabase } from '@/integrations/supabase/client';

export const organizationChartService = {
  // Hierarchische Struktur abrufen
  async getOrganizationHierarchy(filters?: { status?: string }) {
    let query = supabase
      .from('organizational_units')
      .select(`
        *,
        manager:employees!organizational_units_manager_id_fkey(id, first_name, last_name, position, email, phone, status),
        roles:organizational_roles(
          *,
          user:employees(id, first_name, last_name, email, position, status)
        )
      `)
      .eq('is_active', true)
      .order('level', { ascending: true });

    const { data, error } = await query;
    
    if (error) throw error;

    // Hierarchie-Baum erstellen
    const buildHierarchy = (units: any[], parentId: string | null = null): any[] => {
      return units
        .filter(u => u.parent_id === parentId)
        .map(unit => {
          const children = buildHierarchy(units, unit.id);
          const employeeCount = unit.roles?.length || 0;
          const teamsCount = children.length;
          
          // Filter anwenden
          if (filters?.status === 'vacant' && unit.manager) return null;
          if (filters?.status === 'active' && !unit.manager) return null;
          
          return {
            ...unit,
            children,
            employeeCount,
            teamsCount,
            openPositions: Math.floor(Math.random() * 3), // TODO: Aus vacancies berechnen
            performance: Math.floor(Math.random() * 20) + 80 // TODO: Aus KPI-Daten
          };
        })
        .filter(Boolean);
    };

    return buildHierarchy(data || []);
  },

  // Mitarbeiter einer Einheit abrufen
  async getUnitEmployees(unitId: string) {
    const { data, error } = await supabase
      .from('organizational_roles')
      .select(`
        *,
        user:employees(
          id, first_name, last_name, email, phone, position, 
          start_date, status, employee_number
        )
      `)
      .eq('organizational_unit_id', unitId)
      .eq('is_active', true)
      .order('role_type', { ascending: true });

    if (error) throw error;

    return data?.map(role => ({
      id: role.user?.id || role.id,
      name: role.user ? `${role.user.first_name} ${role.user.last_name}` : 'Unbekannt',
      role: role.role_type,
      contact: role.user?.email || '-',
      startDate: role.user?.start_date || role.valid_from,
      performance: Math.floor(Math.random() * 20) + 80, // TODO: Aus Performance-Daten
      status: role.user?.status || 'active'
    })) || [];
  }
};
