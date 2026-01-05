import { Task } from '@/types/tasks';

export interface KanbanTask extends Task {
  kanban_column: 'backlog' | 'in_planning' | 'active' | 'review' | 'done';
  milestone_id?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}
