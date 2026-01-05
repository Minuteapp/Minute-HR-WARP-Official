
export interface ForecastScenario {
  id: string;
  name: string;
  description?: string;
  scenario_type: 'best_case' | 'real_case' | 'worst_case' | 'custom';
  base_template_id?: string;
  multipliers: Record<string, number>;
  adjustments: ForecastScenarioAdjustment[];
  risk_assessment: Record<string, any>;
  confidence_level: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastScenarioAdjustment {
  category: string;
  adjustment_type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
}

export interface ForecastAIRecommendation {
  id: string;
  forecast_instance_id?: string;
  recommendation_type: 'cost_reduction' | 'revenue_increase' | 'risk_mitigation';
  title: string;
  description: string;
  impact_analysis: Record<string, any>;
  confidence_score: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  ai_reasoning?: string;
  data_sources: string[];
  estimated_impact?: number;
  implementation_effort?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ForecastDataConnector {
  id: string;
  name: string;
  connector_type: 'crm' | 'erp' | 'hr' | 'project' | 'finance';
  config: Record<string, any>;
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  last_sync_at?: string;
  sync_status: 'active' | 'error' | 'disabled';
  error_log: any[];
  data_mapping: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastRiskAssessment {
  id: string;
  forecast_instance_id?: string;
  risk_type: 'budget_deviation' | 'cashflow_risk' | 'market_volatility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact_description: string;
  mitigation_strategy?: string;
  trigger_conditions: Record<string, any>;
  early_warning_threshold?: number;
  status: 'active' | 'mitigated' | 'realized' | 'dismissed';
  assigned_to?: string;
  due_date?: string;
  resolved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastApproval {
  id: string;
  forecast_instance_id?: string;
  approver_id: string;
  approval_level: number;
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  comments?: string;
  approval_conditions: Record<string, any>;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  delegated_to?: string;
  signature_token?: string;
  created_at: string;
}

export interface ForecastDashboardWidget {
  id: string;
  user_id: string;
  widget_type: 'kpi_box' | 'chart' | 'table' | 'alert_panel';
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: Record<string, any>;
  data_source?: string;
  refresh_interval: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForecastAISettings {
  id: string;
  user_id: string;
  ai_recommendations_enabled: boolean;
  auto_scenario_generation: boolean;
  risk_analysis_sensitivity: 'low' | 'medium' | 'high';
  early_warning_threshold: number;
  preferred_forecast_horizon: '3_months' | '6_months' | '12_months' | '24_months';
  notification_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ForecastPermission {
  id: string;
  user_id: string;
  permission_type: 'view' | 'create' | 'edit' | 'approve' | 'export' | 'admin';
  resource_type: 'template' | 'instance' | 'scenario' | 'report';
  resource_id?: string;
  granted_by?: string;
  expires_at?: string;
  conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
}
