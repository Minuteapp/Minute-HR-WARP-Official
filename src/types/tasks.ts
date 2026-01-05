
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  reminderDate?: string;
  completed?: boolean;
  assignedTo?: string[];
  subtasks?: Subtask[];
  tags?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
  progress?: number;
  timeLogged?: number; // in minutes
  dependencies?: string[]; // IDs of tasks this task depends on
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  history?: ActivityEntry[];
  projectId?: string; // Feld für Projektzuordnung
  autoTimeTracking?: boolean; // Automatische Zeiterfassung
  notes?: string; // Zusätzliche Notizen
  roadmap_id?: string;
  roadmap_milestone_id?: string;
  roadmap_goal_id?: string;
  roadmap_project_id?: string;
  roadmap_context?: {
    roadmap_title?: string;
    created_in_roadmap?: boolean;
    [key: string]: any;
  };
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignedTo?: string[];
  dueDate?: string;
  dependsOn?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  attachments?: Attachment[];
  mentions?: string[]; // User IDs mentioned in comment
}

export interface ActivityEntry {
  id: string;
  type: 'status_change' | 'priority_change' | 'comment_added' | 'subtask_completed' | 'attachment_added' | 'task_edited';
  user: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

export interface TaskFilter {
  status?: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted' | 'all';
  priority?: 'high' | 'medium' | 'low' | 'all';
  assignedTo?: string | 'all';
  dueDate?: 'today' | 'this-week' | 'overdue' | 'all';
  searchQuery?: string;
}

// Neue erweiterte Filteroption
export interface TaskFilters {
  status: string[];
  priority: string[];
  dueDate: string;
  dueDateCustomRange: {
    from: Date | null;
    to: Date | null;
  };
  tags: string[];
  assignedTo: string[];
  minimumProgress: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  email?: string;
}

export type EventType = 'birthday' | 'meeting' | 'holiday';

export interface Event {
  id: string;
  title: string;
  start_time: string;
  type?: EventType;
}
