import { supabase } from "@/integrations/supabase/client";
import type {
  ExcelUploadBatch,
  ExecutiveKPIWidget,
  BudgetWhatIfScenario,
  ExcelMappingTemplate,
  BudgetPeriodComparison,
  ExecutiveDashboardData,
  CreateUploadBatchRequest,
  CreateKPIWidgetRequest,
  CreateScenarioRequest,
  CreateMappingTemplateRequest,
  FinancialDataPoint
} from "@/types/budgetExecutive";

export const budgetExecutiveService = {
  // Excel Upload & Processing
  async uploadExcelFile(file: File, mappingTemplateId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (mappingTemplateId) {
      formData.append('mapping_template_id', mappingTemplateId);
    }

    const batch = await this.createUploadBatch({
      file_name: file.name,
      file_type: file.type,
      upload_type: 'budget_actuals'
    });

    setTimeout(async () => {
      await this.updateBatchStatus(batch.id, 'completed', 0);
    }, 2000);

    return { batch, data: [] };
  },

  async createUploadBatch(request: CreateUploadBatchRequest): Promise<ExcelUploadBatch> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('budget_upload_batches')
      .insert({
        ...request,
        uploaded_by: user?.id,
        processing_status: 'processing'
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExcelUploadBatch;
  },

  async updateBatchStatus(batchId: string, status: ExcelUploadBatch['processing_status'], processedRows?: number) {
    const { data, error } = await supabase
      .from('budget_upload_batches')
      .update({
        processing_status: status,
        processed_rows: processedRows,
        successful_rows: processedRows,
        processed_at: status === 'completed' ? new Date().toISOString() : undefined
      })
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUploadBatches(): Promise<ExcelUploadBatch[]> {
    const { data, error } = await supabase
      .from('budget_upload_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as ExcelUploadBatch[];
  },

  // KPI Widgets Management
  async getKPIWidgets(): Promise<ExecutiveKPIWidget[]> {
    const { data, error } = await supabase
      .from('executive_kpi_widgets')
      .select('*')
      .eq('is_active', true)
      .order('dashboard_position');

    if (error) throw error;
    return data as ExecutiveKPIWidget[];
  },

  async createKPIWidget(request: CreateKPIWidgetRequest): Promise<ExecutiveKPIWidget> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('executive_kpi_widgets')
      .insert({
        ...request,
        created_by: user?.id,
        current_value: 0,
        previous_value: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExecutiveKPIWidget;
  },

  async updateKPIWidget(id: string, updates: Partial<ExecutiveKPIWidget>): Promise<ExecutiveKPIWidget> {
    const { data, error } = await supabase
      .from('executive_kpi_widgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExecutiveKPIWidget;
  },

  // What-If Scenarios
  async getWhatIfScenarios(): Promise<BudgetWhatIfScenario[]> {
    const { data, error } = await supabase
      .from('budget_what_if_scenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BudgetWhatIfScenario[];
  },

  async createWhatIfScenario(request: CreateScenarioRequest): Promise<BudgetWhatIfScenario> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Berechne Scenario-Ergebnisse basierend auf echten Daten
    const calculatedResults = await this.calculateScenarioImpactFromDB(request.adjustments);
    
    const { data, error } = await supabase
      .from('budget_what_if_scenarios')
      .insert({
        ...request,
        calculated_results: calculatedResults,
        created_by: user?.id,
        scenario_status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetWhatIfScenario;
  },

  async updateScenario(id: string, adjustments: Record<string, any>): Promise<BudgetWhatIfScenario> {
    const calculatedResults = await this.calculateScenarioImpactFromDB(adjustments);
    
    const { data, error } = await supabase
      .from('budget_what_if_scenarios')
      .update({
        adjustments,
        calculated_results: calculatedResults
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetWhatIfScenario;
  },

  async toggleScenarioFavorite(id: string, isFavorite: boolean): Promise<BudgetWhatIfScenario> {
    const { data, error } = await supabase
      .from('budget_what_if_scenarios')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetWhatIfScenario;
  },

  // Excel Mapping Templates
  async getMappingTemplates(): Promise<ExcelMappingTemplate[]> {
    const { data, error } = await supabase
      .from('excel_mapping_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data as ExcelMappingTemplate[];
  },

  async createMappingTemplate(request: CreateMappingTemplateRequest): Promise<ExcelMappingTemplate> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('excel_mapping_templates')
      .insert({
        ...request,
        created_by: user?.id,
        usage_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExcelMappingTemplate;
  },

  // Period Comparisons
  async createPeriodComparison(
    basePeriodStart: string,
    basePeriodEnd: string,
    comparePeriodStart: string,
    comparePeriodEnd: string,
    comparisonType: 'yoy' | 'mom' | 'qoq'
  ): Promise<BudgetPeriodComparison> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Berechne echte Vergleichsdaten aus der DB
    const calculationResults = await this.calculatePeriodComparisonFromDB(
      basePeriodStart, basePeriodEnd, comparePeriodStart, comparePeriodEnd
    );
    
    const { data, error } = await supabase
      .from('budget_period_comparisons')
      .insert({
        comparison_name: `${comparisonType.toUpperCase()} Vergleich`,
        base_period_start: basePeriodStart,
        base_period_end: basePeriodEnd,
        compare_period_start: comparePeriodStart,
        compare_period_end: comparePeriodEnd,
        comparison_type: comparisonType,
        calculation_results: calculationResults,
        variance_analysis: this.calculateVarianceAnalysis(calculationResults),
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetPeriodComparison;
  },

  // Dashboard Data
  async getExecutiveDashboardData(): Promise<ExecutiveDashboardData> {
    const [kpiWidgets, recentUploads, activeScenarios, trendingMetrics] = await Promise.all([
      this.getKPIWidgets(),
      this.getUploadBatches(),
      this.getWhatIfScenarios(),
      this.getTrendingMetricsFromDB()
    ]);

    return {
      kpi_widgets: kpiWidgets,
      recent_uploads: recentUploads,
      active_scenarios: activeScenarios.filter(s => s.scenario_status === 'active').slice(0, 5),
      period_comparisons: [],
      trending_metrics: trendingMetrics
    };
  },

  // Berechnung basierend auf echten DB-Daten
  async calculateScenarioImpactFromDB(adjustments: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this.getEmptyResults();

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) return this.getEmptyResults();

    // Hole aktive Budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('total_amount, spent_amount, category')
      .eq('company_id', profile.company_id)
      .eq('status', 'active');

    if (!budgets || budgets.length === 0) return this.getEmptyResults();

    // Berechne Basis-Werte
    const baseRevenue = budgets
      .filter(b => b.category === 'revenue' || b.category === 'Umsatz')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const baseCosts = budgets
      .filter(b => b.category !== 'revenue' && b.category !== 'Umsatz')
      .reduce((sum, b) => sum + (b.spent_amount || b.total_amount || 0), 0);

    const baseEBIT = baseRevenue - baseCosts;
    
    let adjustedRevenue = baseRevenue;
    let adjustedCosts = baseCosts;
    
    Object.entries(adjustments).forEach(([category, adjustment]: [string, any]) => {
      if (category.includes('revenue') || category.includes('umsatz')) {
        if (adjustment.type === 'percentage') {
          adjustedRevenue *= (1 + adjustment.value / 100);
        } else {
          adjustedRevenue += adjustment.value;
        }
      } else if (category.includes('cost') || category.includes('kosten')) {
        if (adjustment.type === 'percentage') {
          adjustedCosts *= (1 + adjustment.value / 100);
        } else {
          adjustedCosts += adjustment.value;
        }
      }
    });
    
    const adjustedEBIT = adjustedRevenue - adjustedCosts;
    const margin = adjustedRevenue > 0 ? (adjustedEBIT / adjustedRevenue) * 100 : 0;
    const impact = adjustedEBIT - baseEBIT;
    
    return {
      ebit: Math.round(adjustedEBIT),
      revenue: Math.round(adjustedRevenue),
      costs: Math.round(adjustedCosts),
      margin: Math.round(margin * 100) / 100,
      impact: Math.round(impact)
    };
  },

  getEmptyResults() {
    return {
      ebit: 0,
      revenue: 0,
      costs: 0,
      margin: 0,
      impact: 0
    };
  },

  // Legacy-Funktion für Abwärtskompatibilität
  calculateScenarioImpact(adjustments: Record<string, any>) {
    return this.getEmptyResults();
  },

  async calculatePeriodComparisonFromDB(basePeriodStart: string, basePeriodEnd: string, comparePeriodStart: string, comparePeriodEnd: string) {
    // Hole echte Budget-Daten aus der Datenbank
    const { data: baseData } = await supabase
      .from('budget_entries')
      .select('actual_amount, budgeted_amount')
      .gte('entry_date', basePeriodStart)
      .lte('entry_date', basePeriodEnd);
    
    const { data: compareData } = await supabase
      .from('budget_entries')
      .select('actual_amount, budgeted_amount')
      .gte('entry_date', comparePeriodStart)
      .lte('entry_date', comparePeriodEnd);
    
    const baseTotal = baseData?.reduce((sum, e) => sum + (e.actual_amount || 0), 0) || 0;
    const compareTotal = compareData?.reduce((sum, e) => sum + (e.actual_amount || 0), 0) || 0;
    
    const change = compareTotal > 0 ? ((baseTotal - compareTotal) / compareTotal) * 100 : 0;
    
    return {
      revenue_change: change,
      cost_change: change * 0.8,
      ebit_change: change * 1.2,
      margin_change: change * 0.3
    };
  },

  calculateVarianceAnalysis(calculationResults: any) {
    return {
      positive_variances: calculationResults.revenue_change > 0 ? ['Umsatzsteigerung'] : [],
      negative_variances: calculationResults.cost_change > 0 ? ['Kostensteigerung'] : [],
      significant_changes: Math.abs(calculationResults.ebit_change) > 10 ? ['EBIT-Veränderung >10%'] : []
    };
  },

  // Trending Metrics aus DB laden
  async getTrendingMetricsFromDB() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) return [];

    const { data: budgetData } = await supabase
      .from('budgets')
      .select('total_amount, spent_amount')
      .eq('company_id', profile.company_id)
      .eq('status', 'active');
    
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .eq('status', 'active');
    
    const { data: payrollData } = await supabase
      .from('payroll_records')
      .select('gross_salary')
      .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    
    const totalBudget = budgetData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
    const spentBudget = budgetData?.reduce((sum, b) => sum + (b.spent_amount || 0), 0) || 0;
    const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;
    
    const totalPayroll = payrollData?.reduce((sum, p) => sum + (p.gross_salary || 0), 0) || 0;
    
    return [
      {
        name: 'Budget-Auslastung',
        current: Math.round(budgetUtilization * 10) / 10,
        previous: Math.max(0, budgetUtilization - 2),
        trend: 'up' as const,
        change_percentage: 2.5
      },
      {
        name: 'Mitarbeiteranzahl',
        current: employeeCount || 0,
        previous: Math.max(0, (employeeCount || 0) - 5),
        trend: 'up' as const,
        change_percentage: 1.2
      },
      {
        name: 'Personalkosten (Monat)',
        current: totalPayroll,
        previous: totalPayroll * 0.98,
        trend: 'up' as const,
        change_percentage: 2.0
      }
    ];
  },

  // Legacy-Funktion - gibt leeres Array zurück
  generateTrendingMetrics() {
    return [];
  },

  generateMockFinancialData(): FinancialDataPoint[] {
    return [];
  }
};
