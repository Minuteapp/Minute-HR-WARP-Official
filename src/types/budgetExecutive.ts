// Executive Budget & Forecast Types

export interface ExcelUploadBatch {
  id: string;
  file_name: string;
  file_type: string;
  upload_type: 'budget_actuals' | 'forecast_data' | 'cost_data';
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  validation_errors: string[];
  mapping_rules: Record<string, string>;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  uploaded_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutiveKPIWidget {
  id: string;
  kpi_name: string;
  kpi_type: 'ebit' | 'growth' | 'cost_ratio' | 'cashflow' | 'revenue' | 'margin';
  current_value: number;
  previous_value: number;
  target_value?: number;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  calculation_formula: Record<string, any>;
  display_config: {
    color?: string;
    format?: 'currency' | 'percentage' | 'number';
    showTrend?: boolean;
    showTarget?: boolean;
  };
  is_active: boolean;
  dashboard_position: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetWhatIfScenario {
  id: string;
  scenario_name: string;
  base_forecast_id?: string;
  adjustments: Record<string, {
    type: 'percentage' | 'fixed';
    value: number;
    category: string;
  }>;
  calculated_results: {
    ebit?: number;
    revenue?: number;
    costs?: number;
    margin?: number;
    impact?: number;
  };
  scenario_status: 'draft' | 'active' | 'archived';
  is_favorite: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExcelMappingTemplate {
  id: string;
  template_name: string;
  file_pattern?: string;
  column_mappings: {
    revenue?: string;
    costs?: string;
    personnel_costs?: string;
    operating_costs?: string;
    depreciation?: string;
    other_costs?: string;
    interest?: string;
    taxes?: string;
    [key: string]: string | undefined;
  };
  validation_rules: Record<string, any>;
  is_default: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetPeriodComparison {
  id: string;
  comparison_name: string;
  base_period_start: string;
  base_period_end: string;
  compare_period_start: string;
  compare_period_end: string;
  comparison_type: 'yoy' | 'mom' | 'qoq'; // Year-over-Year, Month-over-Month, Quarter-over-Quarter
  calculation_results: {
    revenue_change?: number;
    cost_change?: number;
    ebit_change?: number;
    margin_change?: number;
  };
  variance_analysis: {
    positive_variances: any[];
    negative_variances: any[];
    significant_changes: any[];
  };
  created_by?: string;
  created_at: string;
}

export interface ExecutiveDashboardData {
  kpi_widgets: ExecutiveKPIWidget[];
  recent_uploads: ExcelUploadBatch[];
  active_scenarios: BudgetWhatIfScenario[];
  period_comparisons: BudgetPeriodComparison[];
  trending_metrics: {
    name: string;
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    change_percentage: number;
  }[];
}

export interface FinancialDataPoint {
  account: string;
  amount: number;
  active: boolean;
  category: 'revenue' | 'costs' | 'other';
  subcategory?: string;
  period: string;
}

export interface CreateUploadBatchRequest {
  file_name: string;
  file_type: string;
  upload_type: ExcelUploadBatch['upload_type'];
  mapping_template_id?: string;
}

export interface CreateKPIWidgetRequest {
  kpi_name: string;
  kpi_type: ExecutiveKPIWidget['kpi_type'];
  period_type: ExecutiveKPIWidget['period_type'];
  target_value?: number;
  display_config?: ExecutiveKPIWidget['display_config'];
  dashboard_position: number;
}

export interface CreateScenarioRequest {
  scenario_name: string;
  base_forecast_id?: string;
  adjustments: BudgetWhatIfScenario['adjustments'];
}

export interface CreateMappingTemplateRequest {
  template_name: string;
  file_pattern?: string;
  column_mappings: ExcelMappingTemplate['column_mappings'];
  validation_rules?: Record<string, any>;
  is_default?: boolean;
}