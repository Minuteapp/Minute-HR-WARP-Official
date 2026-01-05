
export interface ForecastTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'budget' | 'personnel' | 'project' | 'growth' | 'crisis' | 'custom';
  forecast_type: 'monthly' | 'quarterly' | 'yearly';
  department?: string;
  template_data: ForecastTemplateData;
  is_default: boolean;
  is_locked: boolean;
  is_active: boolean;
  access_level: 'superadmin' | 'admin';
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  usage_count: number;
}

export interface ForecastTemplateData {
  structure: ForecastCategory[];
  parameters: ForecastParameter[];
  scenarios: ForecastScenario[];
  formulas: ForecastFormula[];
}

export interface ForecastCategory {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  subcategories: ForecastSubcategory[];
  budget_allocation?: number;
}

export interface ForecastSubcategory {
  id: string;
  name: string;
  base_amount: number;
  growth_rate?: number;
  seasonal_factors?: number[];
  notes?: string;
}

export interface ForecastParameter {
  key: string;
  label: string;
  type: 'percentage' | 'amount' | 'factor';
  default_value: number;
  min_value?: number;
  max_value?: number;
  description?: string;
}

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  multipliers: Record<string, number>;
  adjustments: ForecastAdjustment[];
}

export interface ForecastAdjustment {
  category_id: string;
  adjustment_type: 'percentage' | 'fixed';
  value: number;
  apply_from_month?: number;
}

export interface ForecastFormula {
  id: string;
  name: string;
  expression: string;
  variables: string[];
  description?: string;
}

export interface ForecastInstance {
  id: string;
  template_id: string;
  name: string;
  forecast_period_start: string;
  forecast_period_end: string;
  scenario_applied?: string;
  parameter_overrides: Record<string, number>;
  calculated_data: ForecastResult[];
  status: 'draft' | 'active' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastResult {
  category_id: string;
  month: number;
  projected_amount: number;
  confidence_level: number;
  notes?: string;
}

export interface CreateForecastTemplateRequest {
  name: string;
  description?: string;
  category: ForecastTemplate['category'];
  forecast_type: ForecastTemplate['forecast_type'];
  department?: string;
  template_data: ForecastTemplateData;
}

export interface ForecastTemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  changes_summary: string;
  template_snapshot: ForecastTemplate;
  created_by: string;
  created_at: string;
}

export interface ForecastTemplateUsage {
  id: string;
  template_id: string;
  used_by: string;
  forecast_instance_id: string;
  used_at: string;
  scenario_used?: string;
  parameters_modified: Record<string, number>;
}
