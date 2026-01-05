
import { Task, Subtask } from './tasks';

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  defaultDurationDays: number;
  projectId?: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted';
  priority: 'high' | 'medium' | 'low';
  reminderDate?: string;
  assignedTo?: string[];
  subtasks?: Subtask[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
  autoTimeTracking: boolean;
  isTeamTemplate: boolean;
  createdBy: string;
  createdAt: string;
  tags?: string[];
}
