export interface EnterpriseForcast {
  id: string;
  forecast_name: string;
  forecast_type: 'simple_projection' | 'trend_analysis' | 'ml_prediction' | 'scenario_modeling' | 'ml_trend';
  scenario_type: 'optimistic' | 'realistic' | 'pessimistic' | 'custom';
  dimension_type: 'department' | 'project' | 'cost_center' | 'region';
  dimension_id?: string;
  forecast_period_start: string;
  forecast_period_end: string;
  base_amount?: number;
  growth_rate?: number;
  adjustment_factors?: Record<string, number>;
  ai_parameters?: Record<string, any>;
  confidence_level?: number;
  description?: string; // Hinzugefügte Eigenschaft
  status: 'draft' | 'active' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEnterpriseForcastRequest {
  forecast_name: string;
  forecast_type: EnterpriseForcast['forecast_type'];
  scenario_type: EnterpriseForcast['scenario_type'];
  dimension_type: EnterpriseForcast['dimension_type'];
  dimension_id?: string;
  forecast_period_start: string;
  forecast_period_end: string;
  base_amount?: number;
  growth_rate?: number;
  adjustment_factors?: Record<string, number>;
  ai_parameters?: Record<string, any>;
  description?: string; // Hinzugefügte Eigenschaft
}

export interface BudgetDimension {
  id: string;
  name: string;
  type: 'department' | 'project' | 'cost_center' | 'region';
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetDimensionConfig {
  id: string;
  dimension_name: string;
  dimension_type: string;
  dimension_code?: string;
  parent_dimension_id?: string;
  hierarchy_level?: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  step_number: number;
  approver_id: string;
  approver_name: string;
  approval_type: 'required' | 'optional' | 'conditional';
  conditions?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approved_at?: string;
  comments?: string;
  id: string;
  approval_level: string;
}

export interface BudgetApprovalWorkflow {
  id: string;
  workflow_name: string;
  workflow_type: 'sequential' | 'parallel' | 'conditional';
  approval_steps: ApprovalStep[];
  status: 'active' | 'draft' | 'archived' | 'pending';
  created_by?: string;
  created_at: string;
  updated_at: string;
  current_level: number;
  approval_levels: ApprovalStep[];
  approvals: ApprovalStep[];
}

export interface BudgetLineItem {
  id: string;
  budget_plan_id: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  dimension_type: string;
  dimension_id?: string;
  title?: string;
  item_type?: string;
  is_recurring?: boolean;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetScenario {
  id: string;
  budget_plan_id: string;
  scenario_name: string;
  scenario_description?: string;
  scenario_variables: Record<string, any>;
  calculated_impact?: Record<string, any>;
  total_budget_change: number;
  scenario_status: 'draft' | 'active' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetAdjustment {
  category: string;
  adjustment_type: 'percentage' | 'fixed';
  value: number;
}

export interface CashflowProjection {
  id: string;
  budget_plan_id: string;
  month: number;
  year: number;
  projected_inflow: number;
  projected_outflow: number;
  net_cashflow: number;
  cumulative_cashflow: number;
  created_at: string;
  period: string;
  total_inflows: number;
  total_outflows: number;
  closing_balance: number;
}

export interface BudgetAlert {
  id: string;
  budget_plan_id: string;
  alert_type: 'budget_exceeded' | 'threshold_warning' | 'forecast_deviation';
  title?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  threshold_value: number;
  actual_value: number;
  is_acknowledged: boolean;
  created_at: string;
}

export interface AIBudgetInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence_score: number;
  insight_data: Record<string, any>;
  recommended_actions: any[];
  affected_budget_id?: string;
  affected_dimension_type?: string;
  affected_dimension_id?: string;
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface BudgetExport {
  id: string;
  export_type: string;
  export_format: string;
  file_path?: string;
  download_url?: string;
  data_filters: Record<string, any>;
  exported_by?: string;
  file_size?: number;
  download_count: number;
  expires_at?: string;
  created_at: string;
}

export interface ForecastTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  forecast_type: string;
  template_data: ForecastTemplateData;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastTemplateData {
  structure: any[];
  parameters: any[];
  scenarios: any[];
  formulas: any[];
}

export interface ForecastInstance {
  id: string;
  template_id: string;
  name: string;
  forecast_period_start: string;
  forecast_period_end: string;
  scenario_applied?: string;
  parameter_overrides: Record<string, number>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetIntegration {
  id: string;
  source_module: string;
  source_reference_id: string;
  budget_plan_id?: string;
  amount: number;
  currency: string;
  integration_type: 'manual' | 'automatic';
  sync_status: 'synced' | 'pending' | 'failed';
  metadata: Record<string, any>;
  integration_date: string;
  created_at: string;
}

export interface BudgetRolePermission {
  id: string;
  user_id?: string;
  resource_type: string;
  resource_id?: string;
  permission_type: string;
  conditions: Record<string, any>;
  granted_by?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}
