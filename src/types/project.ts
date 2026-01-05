export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'archived' | 'review' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  startDate?: string;
  budget?: number;
  progress: number;
  // Neue Eigenschaften, die in den Komponenten verwendet werden
  responsiblePerson?: string;
  costCenter?: string;
  category?: string;
  teamMembers?: string[];
  team?: any[];
  team_members?: string[]; // Hinzugefügt für Kompatibilität
  client?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  tags?: Tag[];
  currency?: string; // Hinzugefügt, da in NewProjectDialog verwendet
  roadmap_id?: string;
  roadmap_milestone_id?: string;
  roadmap_goal_id?: string;
  roadmap_context?: {
    roadmap_title?: string;
    created_in_roadmap?: boolean;
    [key: string]: any;
  };
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface ProjectStatistics {
  total: number;
  active: number;
  completed: number;
  delayed: number;
}

// Neue Typdefinitionen, die in den Komponenten verwendet werden
export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dependsOn?: string[];
  completionDate?: string;
  status: string;
  projectId?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  version: string;
  category: string;
  fileSize: number;
  filePath: string;
  uploadDate: string;
  uploadedBy: string;
  projectId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  permissions: string;
  avatar?: string;
  email?: string;
  projectId?: string;
}

// Hinzugefügt: TASK_STATUSES für die fehlenden Imports
export const TASK_STATUSES = [
  { id: 'todo', name: 'todo', label: 'Zu erledigen', color: '#3B82F6' },
  { id: 'in-progress', name: 'in-progress', label: 'In Bearbeitung', color: '#F59E0B' },
  { id: 'review', name: 'review', label: 'Überprüfung', color: '#8B5CF6' },
  { id: 'blocked', name: 'blocked', label: 'Blockiert', color: '#EF4444' },
  { id: 'done', name: 'done', label: 'Erledigt', color: '#10B981' }, 
  { id: 'archived', name: 'archived', label: 'Archiviert', color: '#64748B' }
];
