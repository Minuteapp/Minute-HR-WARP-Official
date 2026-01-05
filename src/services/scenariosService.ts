import { supabase } from '@/integrations/supabase/client';

export const scenariosService = {
  // Alle Szenarien abrufen
  async getScenarios() {
    const { data, error } = await supabase
      .from('org_scenarios')
      .select(`
        *,
        creator:employees!org_scenarios_created_by_fkey(
          id, first_name, last_name
        ),
        approver:employees!org_scenarios_approved_by_fkey(
          id, first_name, last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(scenario => {
      const changes = (scenario.changes as any[]) || [];
      const impact = scenario.impact_analysis as any;

      return {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        status: scenario.status,
        createdBy: scenario.creator 
          ? `${scenario.creator.first_name} ${scenario.creator.last_name}`
          : 'System',
        createdAt: scenario.created_at,
        approvedBy: scenario.approver ? `${scenario.approver.first_name} ${scenario.approver.last_name}` : undefined,
        approvedAt: scenario.approved_at,
        changes: changes.map((c: any) => c.description || c),
        impactAnalysis: {
          employeeImpact: impact?.employee_count_change || 0,
          budgetImpact: impact?.budget_change || 0,
          efficiencyImpact: impact?.efficiency_change || 0,
          riskLevel: impact?.risk_score || 0,
          affectedDepartments: impact?.affected_departments?.length || 0
        },
        metrics: {
          employees: impact?.final_employee_count || 0,
          employeeChange: impact?.employee_count_change || 0,
          budget: impact?.final_budget || 0,
          budgetChange: impact?.budget_change || 0,
          efficiency: impact?.efficiency_score || 0,
          efficiencyChange: impact?.efficiency_change || 0,
          risk: impact?.risk_score || 0,
          riskChange: impact?.risk_change || 0,
          departments: impact?.affected_departments?.length || 0
        }
      };
    }) || [];
  },

  // Neues Szenario erstellen
  async createScenario(data: {
    name: string;
    description: string;
    changes: any[];
  }) {
    const { data: user } = await supabase.auth.getUser();
    
    const { data: scenario, error } = await supabase
      .from('org_scenarios')
      .insert({
        name: data.name,
        description: data.description,
        changes: data.changes,
        status: 'draft',
        created_by: user.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return scenario;
  },

  // Szenario genehmigen
  async approveScenario(scenarioId: string) {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('org_scenarios')
      .update({
        status: 'approved',
        approved_by: user.user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', scenarioId);

    if (error) throw error;
  },

  // Szenario duplizieren
  async duplicateScenario(scenarioId: string) {
    const { data: original, error: fetchError } = await supabase
      .from('org_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (fetchError) throw fetchError;

    const { data: user } = await supabase.auth.getUser();

    const { data: duplicate, error: insertError } = await supabase
      .from('org_scenarios')
      .insert({
        name: `${original.name} (Kopie)`,
        description: original.description,
        changes: original.changes,
        impact_analysis: original.impact_analysis,
        status: 'draft',
        created_by: user.user?.id
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return duplicate;
  }
};
