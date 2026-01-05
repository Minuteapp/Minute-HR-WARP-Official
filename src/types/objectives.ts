export interface Objective {
  id: string;
  title: string;
  description?: string;
  objective_type: 'okr' | 'kpi' | 'strategic';
  period_start: string;
  period_end: string;
  owner_id: string;
  team_id?: string;
  company_id?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  progress: number;
  risk_score: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  auto_update_progress: boolean;
  requires_approval: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  linked_projects: string[];
  linked_budgets: string[];
  escalation_rules: Record<string, any>;
  key_results?: KeyResult[];
  audit_trail?: ObjectiveAuditEntry[];
  comments?: ObjectiveComment[];
}

export interface KeyResult {
  id: string;
  objective_id: string;
  metric: string;
  target_value: number;
  current_value: number;
  unit?: string;
  data_source: 'manual' | 'automatic' | 'integration';
  update_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ObjectiveAuditEntry {
  id: string;
  objective_id: string;
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  field_name?: string;
  old_value?: string;
  new_value?: string;
  user_id: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ObjectiveSuggestion {
  id: string;
  user_id: string;
  suggestion_type: 'title' | 'key_result' | 'risk_assessment' | 'target_value';
  suggested_title?: string;
  suggested_metrics: any[];
  confidence_score: number;
  based_on_data: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
}

export interface ObjectiveApproval {
  id: string;
  objective_id: string;
  approver_id: string;
  approval_step: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  escalated_at?: string;
  created_at: string;
}

export interface ObjectiveTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template_data: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveComment {
  id: string;
  objective_id: string;
  user_id: string;
  comment: string;
  is_system_comment: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  objective_type: 'okr' | 'kpi' | 'strategic';
  period_start: string;
  period_end: string;
  owner_id: string;
  team_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  key_results: Omit<KeyResult, 'id' | 'objective_id' | 'created_at' | 'last_updated'>[];
  linked_projects?: string[];
  linked_budgets?: string[];
  requires_approval?: boolean;
  escalation_rules?: Record<string, any>;
}

export interface UpdateObjectiveInput extends Partial<CreateObjectiveInput> {
  id: string;
}

export interface ObjectiveFilters {
  status?: string[];
  priority?: string[];
  objective_type?: string[];
  owner_id?: string;
  team_id?: string;
  period_start?: string;
  period_end?: string;
  search?: string;
}

export interface ObjectiveDashboardData {
  total_objectives: number;
  active_objectives: number;
  completed_objectives: number;
  at_risk_objectives: number;
  avg_progress: number;
  objectives_by_status: Record<string, number>;
  objectives_by_priority: Record<string, number>;
  recent_objectives: Objective[];
  top_performers: Array<{
    objective: Objective;
    performance_score: number;
  }>;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
  confidence: number;
}

export interface ProgressForecast {
  projected_completion: string;
  confidence_interval: {
    min: number;
    max: number;
  };
  trend: 'positive' | 'negative' | 'stable';
  factors: Array<{
    name: string;
    impact: number;
  }>;
}

export interface ObjectiveFormState {
  currentStep: number;
  totalSteps: number;
  data: Partial<CreateObjectiveInput>;
  validation: Record<string, string[]>;
  suggestions: ObjectiveSuggestion[];
  riskAssessment?: RiskAssessment;
  isSubmitting: boolean;
}