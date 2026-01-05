
export type HeadcountForecastPeriod = '12_months' | '24_months' | '36_months';
export type SkillLevel = 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ScenarioStatus = 'draft' | 'active' | 'archived' | 'approved';
export type PlanningScope = 'global' | 'region' | 'country' | 'location' | 'department' | 'team';

export interface WorkforcePlan {
  id: string;
  name: string;
  description?: string;
  scope: PlanningScope;
  scope_id?: string;
  planning_horizon: HeadcountForecastPeriod;
  start_date: string;
  end_date: string;
  status: ScenarioStatus;
  current_headcount: number;
  target_headcount: number;
  budget_allocation: number;
  risk_score: number;
  confidence_level: number;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HeadcountForecast {
  id: string;
  workforce_plan_id: string;
  department: string;
  location: string;
  job_role: string;
  current_count: number;
  forecast_periods: ForecastPeriodData[];
  ai_confidence: number;
  trend_analysis: TrendData;
  risk_factors: RiskFactor[];
  created_at: string;
  updated_at: string;
}

export interface ForecastPeriodData {
  period: string; // YYYY-MM format
  planned_headcount: number;
  predicted_headcount: number;
  budget_required: number;
  attrition_rate: number;
  hiring_required: number;
  confidence_score: number;
}

export interface TrendData {
  direction: 'increasing' | 'decreasing' | 'stable';
  velocity: number;
  seasonality_factor: number;
  external_factors: string[];
}

export interface RiskFactor {
  type: 'attrition' | 'skill_shortage' | 'budget_constraint' | 'market_competition';
  severity: RiskLevel;
  probability: number;
  impact_description: string;
  mitigation_strategy?: string;
}

export interface SkillMatrix {
  id: string;
  department: string;
  location: string;
  team_id?: string;
  skill_assessments: SkillAssessment[];
  skill_gaps: SkillGap[];
  training_recommendations: TrainingRecommendation[];
  hiring_recommendations: HiringRecommendation[];
  last_analyzed: string;
  created_at: string;
  updated_at: string;
}

export interface SkillAssessment {
  skill_name: string;
  skill_category: string;
  current_level: SkillLevel;
  required_level: SkillLevel;
  employee_count: number;
  gap_percentage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SkillGap {
  skill_name: string;
  gap_size: number;
  impact_score: number;
  time_to_close_months: number;
  cost_to_close: number;
  recommended_action: 'hire' | 'train' | 'outsource' | 'reassign';
}

export interface TrainingRecommendation {
  skill_name: string;
  employee_count: number;
  training_duration_hours: number;
  estimated_cost: number;
  expected_roi: number;
  priority_score: number;
}

export interface HiringRecommendation {
  skill_name: string;
  job_role: string;
  headcount_needed: number;
  salary_range_min: number;
  salary_range_max: number;
  time_to_hire_weeks: number;
  priority_score: number;
}

export interface WorkforceScenario {
  id: string;
  name: string;
  description: string;
  base_plan_id: string;
  scenario_variables: ScenarioVariable[];
  impact_analysis: ScenarioImpact;
  status: ScenarioStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioVariable {
  variable_type: 'revenue_growth' | 'attrition_rate' | 'new_locations' | 'project_expansion' | 'cost_reduction';
  current_value: number;
  scenario_value: number;
  impact_weight: number;
}

export interface ScenarioImpact {
  headcount_change: number;
  budget_impact: number;
  skill_gaps_created: SkillGap[];
  risk_changes: RiskFactor[];
  timeline_months: number;
  implementation_steps: string[];
}

export interface WorkforceHeatmapData {
  id: string;
  scope: PlanningScope;
  scope_id: string;
  scope_name: string;
  metrics: HeatmapMetric[];
  risk_level: RiskLevel;
  last_updated: string;
}

export interface HeatmapMetric {
  metric_type: 'headcount_variance' | 'skill_gap_severity' | 'attrition_risk' | 'budget_variance';
  current_value: number;
  target_value: number;
  variance_percentage: number;
  color_code: string;
  drill_down_data?: any[];
}

export interface WorkforceRiskAssessment {
  id: string;
  assessment_date: string;
  scope: PlanningScope;
  scope_id: string;
  overall_risk_score: number;
  risk_categories: RiskCategory[];
  mitigation_plans: MitigationPlan[];
  next_review_date: string;
  created_by: string;
  created_at: string;
}

export interface RiskCategory {
  category: 'operational' | 'financial' | 'strategic' | 'compliance';
  risk_score: number;
  key_risks: RiskFactor[];
  impact_assessment: string;
}

export interface MitigationPlan {
  risk_id: string;
  strategy: string;
  actions: MitigationAction[];
  timeline_weeks: number;
  cost_estimate: number;
  success_probability: number;
  assigned_to: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
}

export interface MitigationAction {
  action_description: string;
  due_date: string;
  responsible_person: string;
  completion_status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface WorkforceAnalytics {
  id: string;
  analysis_period_start: string;
  analysis_period_end: string;
  key_metrics: AnalyticsMetric[];
  predictions: PredictionModel[];
  recommendations: AIRecommendation[];
  data_quality_score: number;
  generated_at: string;
}

export interface AnalyticsMetric {
  metric_name: string;
  current_value: number;
  previous_value: number;
  trend_percentage: number;
  benchmark_value?: number;
  target_value?: number;
  unit: string;
}

export interface PredictionModel {
  model_type: 'headcount_forecast' | 'attrition_prediction' | 'skill_demand' | 'cost_projection';
  prediction_accuracy: number;
  confidence_interval: [number, number];
  key_factors: string[];
  prediction_data: any[];
  model_version: string;
}

export interface AIRecommendation {
  recommendation_type: 'hiring' | 'training' | 'restructure' | 'budget_reallocation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expected_impact: string;
  implementation_cost: number;
  roi_estimate: number;
  timeline_weeks: number;
  confidence_score: number;
}

export interface WorkforceCompliance {
  id: string;
  compliance_type: 'labor_law' | 'works_council' | 'data_protection' | 'equal_opportunity';
  plan_id: string;
  compliance_status: 'compliant' | 'at_risk' | 'non_compliant';
  requirements: ComplianceRequirement[];
  audit_trail: AuditEntry[];
  next_review_date: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirement {
  requirement_id: string;
  description: string;
  mandatory: boolean;
  current_status: 'met' | 'partially_met' | 'not_met';
  evidence: string[];
  responsible_person: string;
  due_date?: string;
}

export interface AuditEntry {
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  changes_made: Record<string, any>;
  business_justification: string;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface CreateWorkforcePlanRequest {
  name: string;
  description?: string;
  scope: PlanningScope;
  scope_id?: string;
  planning_horizon: HeadcountForecastPeriod;
  start_date: string;
  end_date: string;
  budget_allocation: number;
  initial_variables?: Record<string, any>;
}

export interface CreateScenarioRequest {
  name: string;
  description: string;
  base_plan_id: string;
  variables: {
    revenue_growth?: number;
    attrition_rate?: number;
    new_locations?: string[];
    project_expansion?: boolean;
    cost_reduction_target?: number;
  };
}

export interface WorkforceMetrics {
  total_employees: number;
  planned_employees: number;
  variance_percentage: number;
  skill_gaps_count: number;
  high_risk_departments: number;
  budget_utilization: number;
  forecast_accuracy: number;
  compliance_score: number;
}
