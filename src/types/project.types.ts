
export type ProjectStatus = 'pending' | 'active' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high';
export type ProjectVisibility = 'internal' | 'external' | 'public';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  budget_spent?: number;
  progress: number;
  category_id?: string;
  template_id?: string;
  owner_id: string;
  team_members: string[];
  tags: Tag[];
  custom_fields: Record<string, any>;
  milestone_data: any[];
  dependencies: any[];
  created_at: string;
  updated_at: string;
  currency: string;
  project_type: string;
  visibility: ProjectVisibility;
  is_template: boolean;
  // Zusätzliche Eigenschaften für Kompatibilität
  createdAt: string;
  dueDate?: string;
  startDate?: string;
  updatedAt?: string;
  responsiblePerson?: string;
  costCenter?: string;
  category?: string;
  client?: string;
  createdBy?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  template_data: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  project_categories?: ProjectCategory;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: ProjectPriority;
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completion_date?: string;
  status: string;
  dependencies: any[];
  created_at: string;
  updated_at: string;
}

export interface ProjectBudgetEntry {
  id: string;
  project_id: string;
  amount: number;
  entry_type: string;
  category?: string;
  description?: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleLink {
  id: string;
  project_id: string;
  module_type: string;
  reference_id: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const TASK_STATUSES = [
  { id: 'todo', name: 'todo', label: 'Zu erledigen', color: '#3B82F6' },
  { id: 'in-progress', name: 'in-progress', label: 'In Bearbeitung', color: '#F59E0B' },
  { id: 'review', name: 'review', label: 'Überprüfung', color: '#8B5CF6' },
  { id: 'blocked', name: 'blocked', label: 'Blockiert', color: '#EF4444' },
  { id: 'done', name: 'done', label: 'Erledigt', color: '#10B981' }, 
  { id: 'archived', name: 'archived', label: 'Archiviert', color: '#64748B' }
];

export interface ProjectStatistics {
  total: number;
  active: number;
  completed: number;
  delayed: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  permissions: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  email?: string;
  projectId?: string;
}
