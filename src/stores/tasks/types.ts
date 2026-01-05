
import { Task } from '@/types/tasks';

export type { Task }; // Hier exportieren wir den Task-Typ

export interface TasksStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<Task | null>;
  updateTask: (taskId: string, updateData: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  archiveTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string, completed: boolean) => Promise<boolean>;
  
  // Batch-Operationen
  batchUpdateTasks: (taskIds: string[], updateData: Partial<Task>) => Promise<boolean>;
  batchDeleteTasks: (taskIds: string[]) => Promise<boolean>;
  batchArchiveTasks: (taskIds: string[]) => Promise<boolean>;
}
