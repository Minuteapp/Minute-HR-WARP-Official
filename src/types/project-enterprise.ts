// ========================================
// ENTERPRISE PROJECT COCKPIT TYPES
// ========================================

export interface EnterpriseProject {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'archived' | 'review' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  
  // Erweiterte Enterprise Felder
  budget_breakdown: BudgetCategory[];
  forecast_files: ForecastFile[];
  actual_cost: number;
  cost_overrun_risk: number;
  
  // OKRs & Performance
  objectives: ProjectObjective[];
  key_results: ProjectKeyResult[];
  okr_progress: number;
  
  // Predictive Analytics
  delay_probability: number;
  cost_overrun_probability: number;
  success_prediction: number;
  ai_recommendations: AIRecommendation[];
  
  // Skills & Workforce
  required_skills: SkillRequirement[];
  skill_gaps: SkillGap[];
  workload_heatmap: WorkloadHeatmap;
  
  // Compliance & Risk
  compliance_checks: ComplianceCheck[];
  risk_matrix: RiskAssessment[];
  audit_trail: AuditEntry[];
  
  // Bonus & Incentives
  bonus_triggers: BonusTrigger[];
  incentive_status: 'pending' | 'triggered' | 'paid' | 'expired';
  
  // Enterprise Metadata
  enterprise_level: 'standard' | 'advanced' | 'enterprise';
  strategic_importance: 'low' | 'medium' | 'high' | 'critical';
  program_id?: string;
  
  // Performance Metrics
  roi_target: number;
  roi_actual: number;
  productivity_score: number;
  quality_score: number;
  
  // Time Tracking Integration
  estimated_hours: number;
  logged_hours: number;
  overtime_hours: number;
  
  // Forecasting
  forecast_accuracy: number;
  next_milestone_prediction?: string;
  completion_prediction?: string;
  
  // Basis Felder
  owner_id?: string;
  team_members?: string[];
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

// ========================================
// BUDGET & FORECAST
// ========================================
export interface BudgetCategory {
  id: string;
  project_id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  reserved_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: string;
  upload_date: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  forecast_data: any;
  validation_errors: string[];
}

// ========================================
// OKRs & PERFORMANCE
// ========================================
export interface ProjectObjective {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  weight: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectKeyResult {
  id: string;
  objective_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit?: string;
  measurement_type: 'numeric' | 'percentage' | 'boolean';
  status: 'active' | 'completed' | 'at_risk' | 'behind';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// PREDICTIVE ANALYTICS
// ========================================
export interface ProjectPrediction {
  id: string;
  project_id: string;
  prediction_type: 'delay' | 'cost_overrun' | 'success' | 'resource_shortage';
  probability: number;
  confidence_level?: number;
  factors: PredictionFactor[];
  recommendations: AIRecommendation[];
  created_at: string;
  valid_until: string;
}

export interface PredictionFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface AIRecommendation {
  id: string;
  type: 'warning' | 'suggestion' | 'critical' | 'optimization';
  title: string;
  description: string;
  action_required: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_impact?: string;
}

// ========================================
// SKILLS & WORKFORCE
// ========================================
export interface SkillRequirement {
  skill_name: string;
  required_level: 1 | 2 | 3 | 4 | 5;
  required_hours: number;
  allocated_hours: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SkillGap {
  skill_name: string;
  required_level: number;
  current_level: number;
  gap_severity: 'minor' | 'moderate' | 'major' | 'critical';
  suggested_actions: string[];
}

export interface WorkloadHeatmap {
  teamId: string;
  utilization: number[][];
  weeks: string[];
  skills: string[];
}

// ========================================
// COMPLIANCE & RISK
// ========================================
export interface ComplianceCheck {
  id: string;
  check_type: string;
  rule_name: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  checked_at?: string;
  checked_by?: string;
  findings?: string;
  remediation_required: boolean;
  remediation_notes?: string;
  next_check_date?: string;
}

export interface RiskAssessment {
  id: string;
  risk_type: string;
  description: string;
  probability: number;
  impact: number;
  mitigation_strategy?: string;
  owner?: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'resolved';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  changed_by: string;
  change_description: string;
  old_values?: any;
  new_values?: any;
  change_type: 'create' | 'update' | 'delete' | 'status_change';
}

// ========================================
// BONUS & INCENTIVES
// ========================================
export interface BonusTrigger {
  id: string;
  trigger_type: 'completion' | 'budget_under' | 'quality_score' | 'time_bonus' | 'okr_achievement';
  condition_data: any;
  reward_type: 'monetary' | 'time_off' | 'recognition' | 'promotion_points';
  reward_value?: number;
  reward_description?: string;
  status: 'active' | 'triggered' | 'paid' | 'expired' | 'cancelled';
  triggered_at?: string;
  triggered_by?: string;
}

// ========================================
// DASHBOARD METRICS
// ========================================
export interface ProjectDashboardMetrics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  at_risk_projects: number;
  average_delay_probability: number;
  average_cost_overrun_risk: number;
  total_budget_allocated: number;
  total_budget_spent: number;
  average_roi: number;
  top_risks: RiskAssessment[];
  upcoming_milestones: any[];
}

// ========================================
// CHARTS & VISUALIZATION DATA
// ========================================
export interface BudgetChartData {
  categories: string[];
  allocated: number[];
  spent: number[];
  remaining: number[];
}

export interface ProgressChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  color?: string;
}