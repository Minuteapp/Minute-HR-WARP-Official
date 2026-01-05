
export type GoalCategory = 'personal' | 'team' | 'company';
export type GoalStatus = 'active' | 'completed' | 'archived' | 'deleted';
export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalType = 'smart' | 'okr' | 'quantitative' | 'qualitative';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  goal_type?: GoalType;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  team_id?: string;
  parent_goal_id?: string;
  metadata?: Record<string, unknown> | null;
  deleted_at?: string;
  archived_at?: string;
  checklist?: ChecklistItem[];
  kpi_target?: string;
  kpi_current?: string;
  measurement_unit?: string;
  evaluation_criteria?: string;
  linked_project_id?: string;
  linked_task_id?: string;
  auto_reminders?: boolean;
  reminder_frequency?: 'daily' | 'weekly' | 'monthly';
  requires_approval?: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  status: 'open' | 'completed';
  goal_id: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  due_date?: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  goal_type: GoalType;
  fields: GoalTemplateField[];
  created_at: string;
  updated_at: string;
  is_public: boolean;
  usage_count: number;
}

export interface GoalTemplateField {
  name: string;
  type: 'text' | 'date' | 'number' | 'select';
  placeholder: string;
  required: boolean;
  options?: string[];
  default_value?: string;
}

export interface GoalComment {
  id: string;
  goal_id: string;
  user_id: string;
  comment: string;
  rating?: number;
  is_system_comment: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalAttachment {
  id: string;
  goal_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface GoalAuditLogEntry {
  id: string;
  goal_id: string;
  user_id: string;
  action: string;
  changes: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  created_at: string;
  updated_at: string;
}

export interface GoalEvaluation {
  id: string;
  goal_id: string;
  evaluator_id: string;
  evaluation_period: string;
  overall_rating: number;
  achievement_rating: number;
  quality_rating: number;
  efficiency_rating: number;
  feedback: string;
  recommendations: string;
  created_at: string;
  updated_at: string;
}

export interface GoalIntegration {
  project_id?: string;
  task_ids?: string[];
  training_id?: string;
  performance_review_id?: string;
  department_goal_id?: string;
}
