// Erweiterte Typen für das vollständige Ziele-Modul

export interface GoalCycle {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cycle_type: 'quarterly' | 'yearly' | 'custom';
  status: 'active' | 'completed' | 'archived';
  company_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  unit: 'number' | 'percent' | 'currency' | 'boolean';
  baseline_value: number;
  target_value: number;
  current_value: number;
  progress_method: 'manual' | 'formula' | 'source';
  source_module?: string;
  source_metric?: string;
  formula?: string;
  weight: number;
  status: 'active' | 'completed' | 'at_risk' | 'off_track';
  confidence_level: number; // 0-1
  is_at_risk: boolean;
  company_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalCheckin {
  id: string;
  goal_id: string;
  key_result_id?: string;
  progress_value?: number;
  confidence_level: number; // 0-1
  status_update: 'on_track' | 'at_risk' | 'off_track';
  comment?: string;
  next_steps?: string;
  blockers?: string;
  achievements?: string;
  checkin_date: string;
  submitted_by?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalLink {
  id: string;
  goal_id: string;
  key_result_id?: string;
  source_module: string; // Projects, Tasks, Helpdesk, ESG, etc.
  source_id: string;
  source_type: string; // project, task, ticket, initiative, etc.
  link_type: 'contributes_to' | 'depends_on' | 'blocks';
  weight: number;
  auto_update: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalReview {
  id: string;
  goal_id: string;
  review_type: 'mid_cycle' | 'end_cycle' | 'quarterly';
  review_period: string;
  overall_score?: number;
  achievement_score?: number;
  quality_score?: number;
  reviewer_feedback?: string;
  self_assessment?: string;
  lessons_learned?: string;
  next_period_focus?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  reviewed_by?: string;
  submitted_by?: string;
  review_date?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

// Erweiterte Goal-Typen
export interface EnhancedGoal {
  id: string;
  title: string;
  description?: string;
  category: 'personal' | 'team' | 'company';
  goal_type?: 'smart' | 'okr' | 'quantitative' | 'qualitative';
  goal_level: 'individual' | 'team' | 'company';
  status: 'active' | 'completed' | 'archived' | 'deleted';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  start_date: string;
  due_date: string;
  cycle_id?: string;
  alignment_parent_id?: string;
  weight: number;
  confidence_level: number;
  is_at_risk: boolean;
  last_checkin_date?: string;
  review_status: 'pending' | 'in_review' | 'approved' | 'rejected';
  review_notes?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  team_id?: string;
  parent_goal_id?: string;
  metadata?: Record<string, unknown> | null;
  
  // Relationen
  cycle?: GoalCycle;
  key_results?: KeyResult[];
  checkins?: GoalCheckin[];
  links?: GoalLink[];
  reviews?: GoalReview[];
  alignment_children?: EnhancedGoal[];
}

// Dashboard Widget Typen
export interface GoalDashboardLayout {
  id: string;
  device: 'mobile' | 'desktop';
  grid: {
    cols: number;
    gutter: number;
    rowHeight: number;
  };
  widgets: GoalWidget[];
  visibility: {
    roles: string[];
  };
}

export interface GoalWidget {
  id: string;
  type: 'kpi_card' | 'list_compact' | 'tree_mini' | 'bar' | 'quick_actions';
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dataSourceId: string;
  props?: Record<string, any>;
  action?: {
    route: string;
  };
  actions?: Array<{
    label: string;
    route: string;
  }>;
}

export interface GoalDataSource {
  id: string;
  module: string;
  query: {
    metric?: string;
    scope?: string;
    entity?: string;
    filter?: Record<string, any>;
    goalScope?: string;
  };
}

// Template Typen
export interface OKRTemplate {
  id: string;
  level: 'company' | 'team' | 'individual';
  title: string;
  weight?: number;
  type?: 'okr' | 'mbo';
  keyResults: Array<{
    title: string;
    unit: string;
    baseline: number;
    target: number;
    method: 'source' | 'formula' | 'manual';
    sourceRef?: {
      module: string;
      metric: string;
    };
    formula?: string;
  }>;
  bonus?: {
    payoutCurve: 'linear' | 'stepped';
    threshold: number;
    cap: number;
  };
}

// Progress Engine Typen
export interface ProgressCalculation {
  goal_id: string;
  current_progress: number;
  target_progress: number;
  confidence_level: number;
  is_at_risk: boolean;
  calculation_method: 'manual' | 'formula' | 'source';
  last_updated: string;
  contributors: Array<{
    source_module: string;
    source_id: string;
    contribution_value: number;
    weight: number;
  }>;
}

// Event Bus Typen
export interface GoalEvent {
  type: 'goals.goal.created' | 'goals.goal.updated' | 'goals.goal.completed' | 
        'goals.keyresult.updated' | 'goals.checkin.submitted' | 'goals.review.completed';
  payload: {
    goal_id: string;
    user_id: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  timestamp: string;
}

// KI-Assistenz Typen
export interface GoalAISuggestion {
  id: string;
  goal_id?: string;
  suggestion_type: 'goal_creation' | 'kr_optimization' | 'bias_check' | 'early_warning';
  title: string;
  description: string;
  confidence_score: number;
  action_items: string[];
  bias_risks?: string[];
  improvement_suggestions?: string[];
  created_at: string;
}

// Alignment Typen
export interface AlignmentTreeNode {
  id: string;
  title: string;
  goal_level: 'company' | 'team' | 'individual';
  progress: number;
  confidence_level: number;
  is_at_risk: boolean;
  parent_id?: string;
  children: AlignmentTreeNode[];
  position: {
    x: number;
    y: number;
  };
}

export interface AlignmentGap {
  id: string;
  parent_goal_id: string;
  potential_child_goal_id: string;
  gap_type: 'missing_alignment' | 'weak_connection' | 'misaligned_metrics';
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  auto_fix_possible: boolean;
}