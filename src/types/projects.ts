export type ProjectStatus = 'draft' | 'planned' | 'active' | 'completed' | 'cancelled' | 'on_hold';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'blocked' | 'done' | 'cancelled';
export type RiskStatus = 'open' | 'mitigated' | 'closed' | 'escalated';

export interface ProjectHealth {
  scope: 'green' | 'amber' | 'red';
  budget: 'green' | 'amber' | 'red';
  schedule: 'green' | 'amber' | 'red';
  people: 'green' | 'amber' | 'red';
}

export interface ProjectBudget {
  currency: string;
  capex: number;
  opex: number;
  forecast: number;
  actuals: number;
  variance?: number;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  assignees: string[];
  due_date?: string;
  start_date?: string;
  estimate_hours: number;
  spent_hours: number;
  status: TaskStatus;
  priority: ProjectPriority;
  progress: number;
  dependencies: string[];
  tags: string[];
  attachments: any[];
  location?: string;
  skill_requirements: string[];
  company_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  date: string;
  description?: string;
  color: string;
  is_completed: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  probability: number; // 1-5
  impact: number; // 1-5
  owner_id?: string;
  mitigation?: string;
  status: RiskStatus;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectResource {
  id: string;
  project_id: string;
  user_id: string;
  role?: string;
  capacity_hours_per_week: number;
  allocation_hours_per_week: number;
  cost_rate: number;
  start_date?: string;
  end_date?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocumentLink {
  id: string;
  project_id?: string;
  task_id?: string;
  reference_id: string;
  reference_type: 'document' | 'calendar' | 'helpdesk' | 'goal' | 'shift' | 'esg' | 'expense';
  metadata: any;
  company_id?: string;
  created_at: string;
}

export interface ProjectTemplate {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  default_start_offset_days: number;
  roles: string[];
  project_config: any;
  milestones: any[];
  tasks: any[];
  is_active: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDashboardLayout {
  id: string;
  device: 'mobile' | 'desktop';
  grid_config: {
    cols: number;
    gutter: number;
    rowHeight: number;
  };
  widgets: ProjectWidget[];
  visibility: {
    roles: string[];
  };
  is_active: boolean;
  created_at: string;
}

export interface ProjectWidget {
  id: string;
  type: 'segmented_kpi' | 'list_compact' | 'kpi_card' | 'line' | 'bar' | 'quick_actions';
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dataSourceId?: string;
  action?: {
    route: string;
    params?: any;
  };
  actions?: Array<{
    label: string;
    route: string;
  }>;
  props?: any;
}

export interface ProjectDashboardDataSource {
  id: string;
  module: string;
  query_config: any;
  cache_ttl_seconds: number;
  is_active: boolean;
  created_at: string;
}

export interface ProjectEventTopic {
  id: string;
  topic: string;
  module: string;
  entity: string;
  event_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectAuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  before_data?: any;
  after_data?: any;
  company_id?: string;
  created_at: string;
}

// Form types
export interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  end_date?: string;
  department_id?: string;
  tags: string[];
  okr_links: any[];
  risk_level: string;
  health: ProjectHealth;
  template_id?: string;
  custom_fields: any;
  budget?: ProjectBudget;
}

export interface TaskFormData {
  title: string;
  description?: string;
  assignees: string[];
  due_date?: string;
  start_date?: string;
  estimate_hours: number;
  priority: ProjectPriority;
  dependencies: string[];
  tags: string[];
  location?: string;
  skill_requirements: string[];
}

// View types
export type ProjectView = 'spreadsheet' | 'timeline' | 'calendar' | 'board' | 'roadmap' | 'mindmap' | 'flow' | 'structure' | 'reports';

export interface ProjectFilter {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  assignee?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  searchQuery?: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: ProjectPriority[];
  assignee?: string[];
  dueDate?: string;
  project?: string[];
  tags?: string[];
  searchQuery?: string;
}