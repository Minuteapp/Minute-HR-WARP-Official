import { supabase } from "@/integrations/supabase/client";
import type {
  BudgetLineItem,
  BudgetScenario,
  BudgetAdjustment,
  CashflowProjection,
  BudgetAlert
} from "@/types/budgetEnterprise";

export const budgetCalculationService = {
  async getLineItems(budgetPlanId: string) {
    const { data, error } = await supabase
      .from('budget_line_items')
      .select('*')
      .eq('budget_plan_id', budgetPlanId);
    
    if (error) throw error;
    return data as BudgetLineItem[];
  },

  async createLineItem(lineItem: Omit<BudgetLineItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('budget_line_items')
      .insert(lineItem)
      .select()
      .single();
    
    if (error) throw error;
    return data as BudgetLineItem;
  },

  async updateLineItem(id: string, updates: Partial<BudgetLineItem>) {
    const { data, error } = await supabase
      .from('budget_line_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as BudgetLineItem;
  },

  async deleteLineItem(id: string) {
    const { error } = await supabase
      .from('budget_line_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getScenarios(budgetPlanId: string) {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .select('*')
      .eq('budget_plan_id', budgetPlanId);
    
    if (error) throw error;
    return data as BudgetScenario[];
  },

  async createScenario(scenario: Omit<BudgetScenario, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .insert(scenario)
      .select()
      .single();
    
    if (error) throw error;
    return data as BudgetScenario;
  },

  async calculateScenario(budgetPlanId: string, adjustments: BudgetAdjustment[]) {
    // Simuliere Szenario-Berechnung
    const results = adjustments.map(adj => ({
      category: adj.category,
      originalAmount: 1000, // Beispielwert
      adjustedAmount: adj.adjustment_type === 'percentage' 
        ? 1000 * (1 + adj.value / 100)
        : 1000 + adj.value,
      impact: adj.value
    }));
    
    return { results, totalImpact: results.reduce((sum, r) => sum + r.impact, 0) };
  },

  async generateCashflowProjection(budgetPlanId: string, scenarioId?: string) {
    // Simuliere Cashflow-Projektion mit korrekten Eigenschaften
    const projections: CashflowProjection[] = [];
    let cumulativeCashflow = 0;
    
    for (let month = 1; month <= 12; month++) {
      const inflow = Math.random() * 50000 + 30000;
      const outflow = Math.random() * 40000 + 25000;
      const netCashflow = inflow - outflow;
      cumulativeCashflow += netCashflow;
      
      projections.push({
        id: `${budgetPlanId}-${month}`,
        budget_plan_id: budgetPlanId,
        month,
        year: new Date().getFullYear(),
        projected_inflow: inflow,
        projected_outflow: outflow,
        net_cashflow: netCashflow,
        cumulative_cashflow: cumulativeCashflow,
        created_at: new Date().toISOString(),
        // Zusätzliche Eigenschaften für die Chart-Komponente
        period: `2024-${month.toString().padStart(2, '0')}`,
        total_inflows: inflow,
        total_outflows: outflow,
        closing_balance: cumulativeCashflow
      });
    }
    
    return projections;
  },

  async checkBudgetAlerts(budgetPlanId: string) {
    // Simuliere Budget-Alerts
    const alerts: BudgetAlert[] = [
      {
        id: `alert-${budgetPlanId}-1`,
        budget_plan_id: budgetPlanId,
        alert_type: 'budget_exceeded',
        message: 'Budget für Kategorie "Marketing" um 15% überschritten',
        severity: 'high',
        threshold_value: 10000,
        actual_value: 11500,
        is_acknowledged: false,
        created_at: new Date().toISOString()
      }
    ];
    
    return alerts;
  },

  async getActualVsBudget(budgetPlanId: string) {
    // Simuliere Ist vs. Budget Vergleich mit korrekten Eigenschaften
    return {
      categories: [
        { name: 'Personal', budget: 50000, actual: 48000, variance: -2000 },
        { name: 'Marketing', budget: 20000, actual: 23000, variance: 3000 },
        { name: 'IT', budget: 15000, actual: 14500, variance: -500 }
      ],
      totalBudget: 85000,
      totalActual: 85500,
      totalVariance: 500,
      budget_amount: 85000,
      actual_amount: 85500,
      variance: 500,
      variance_percentage: 0.59,
      period_analysis: [
        { period: '2024-01', budget: 20000, actual: 19000, variance: -1000 },
        { period: '2024-02', budget: 22000, actual: 21500, variance: -500 },
        { period: '2024-03', budget: 21000, actual: 22000, variance: 1000 },
        { period: '2024-04', budget: 22000, actual: 23000, variance: 1000 }
      ]
    };
  },

  async getForecastHeatmapData(budgetPlanId: string) {
    // Simuliere Heatmap-Daten mit korrekten Eigenschaften
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
    const categories = ['Personal', 'Marketing', 'IT', 'Verwaltung'];
    
    return months.map(month => 
      categories.map(category => ({
        month,
        category,
        value: Math.random() * 100,
        variance: (Math.random() - 0.5) * 20,
        // Zusätzliche Eigenschaften für die Heatmap-Komponente
        period: `2024-${months.indexOf(month) + 1}`,
        status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'warning' : 'good',
        confidence: Math.random() * 0.3 + 0.7
      }))
    ).flat();
  }
};
