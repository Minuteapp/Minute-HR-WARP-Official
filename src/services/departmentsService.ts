import { supabase } from '@/integrations/supabase/client';

export interface DepartmentFilters {
  location?: string;
  department?: string;
  budgetMin?: number;
  budgetMax?: number;
  performanceMin?: number;
  performanceMax?: number;
  turnoverMin?: number;
  turnoverMax?: number;
  utilizationMin?: number;
  utilizationMax?: number;
}

export const departmentsService = {
  // Alle Abteilungen mit Metriken abrufen
  async getDepartmentsWithMetrics(filters?: DepartmentFilters) {
    let query = supabase
      .from('organizational_units')
      .select(`
        *,
        manager:employees!organizational_units_manager_id_fkey(
          id, first_name, last_name, position
        ),
        kpi_metrics:org_kpi_metrics(
          employee_count, turnover_rate, satisfaction_score, 
          efficiency_score, budget_allocated, budget_used, vacancies
        ),
        roles:organizational_roles(count)
      `)
      .in('type', ['department', 'area'])
      .eq('is_active', true);

    if (filters?.location) {
      query = query.eq('address->>city', filters.location);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Berechne zusätzliche Metriken
    let departments = data?.map(dept => {
      const latestKPI = dept.kpi_metrics?.[0];
      const openPositions = latestKPI?.vacancies || 0;
      // Echte Werte aus KPI-Daten oder 0, keine Random-Werte mehr
      const projects = 0; // Wird über separate projects-Abfrage befüllt
      const utilization = latestKPI?.efficiency_score || 0;
      const budgetAllocated = latestKPI?.budget_allocated || 0;
      const budgetUsed = latestKPI?.budget_used || 0;

      return {
        id: dept.id,
        name: dept.name,
        manager: dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : 'Vakant',
        managerId: dept.manager_id,
        location: dept.address?.city || '-',
        employeeCount: latestKPI?.employee_count || 0,
        budget: budgetAllocated,
        budgetUsed,
        projects,
        openPositions,
        turnover: latestKPI?.turnover_rate || 0,
        satisfaction: latestKPI?.satisfaction_score || 0,
        targetStatus: latestKPI?.efficiency_score || 0,
        utilization,
        code: (dept.metadata as any)?.code || dept.name.substring(0, 3).toUpperCase()
      };
    }) || [];

    // Filter anwenden
    if (filters?.department) {
      departments = departments.filter(d => 
        d.name.toLowerCase().includes(filters.department!.toLowerCase()) ||
        d.manager.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    if (filters?.budgetMin !== undefined) {
      departments = departments.filter(d => d.budget >= filters.budgetMin!);
    }

    if (filters?.budgetMax !== undefined) {
      departments = departments.filter(d => d.budget <= filters.budgetMax!);
    }

    if (filters?.performanceMin !== undefined) {
      departments = departments.filter(d => d.targetStatus >= filters.performanceMin!);
    }

    if (filters?.performanceMax !== undefined) {
      departments = departments.filter(d => d.targetStatus <= filters.performanceMax!);
    }

    if (filters?.turnoverMin !== undefined) {
      departments = departments.filter(d => d.turnover >= filters.turnoverMin!);
    }

    if (filters?.turnoverMax !== undefined) {
      departments = departments.filter(d => d.turnover <= filters.turnoverMax!);
    }

    if (filters?.utilizationMin !== undefined) {
      departments = departments.filter(d => d.utilization >= filters.utilizationMin!);
    }

    if (filters?.utilizationMax !== undefined) {
      departments = departments.filter(d => d.utilization <= filters.utilizationMax!);
    }

    return departments;
  },

  // Filter-Optionen abrufen
  async getFilterOptions() {
    const { data: units } = await supabase
      .from('organizational_units')
      .select('name, code, address')
      .in('type', ['department', 'area'])
      .not('address', 'is', null);

    const locations = [...new Set(units?.map(l => l.address?.city).filter(Boolean))] as string[];
    const departments = units?.map(u => ({ name: u.name, code: u.code })) || [];

    return {
      locations,
      departments
    };
  }
};
