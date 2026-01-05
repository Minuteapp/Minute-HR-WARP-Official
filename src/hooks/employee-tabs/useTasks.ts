import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { emitEvent } from '@/services/eventEmitterService';
import { useTenant } from '@/contexts/TenantContext';

export interface Task {
  id: string;
  project_id?: string;
  assigned_to?: string[];
  created_by?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress: number;
  tags?: string[];
  parent_task_id?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = (employeeId?: string) => {
  const queryClient = useQueryClient();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['employee-tasks', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .contains('assigned_to', [employeeId])
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!employeeId,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'progress'>) => {
      if (!companyId) throw new Error("Company ID fehlt - bitte neu laden");
      
      const { data: user } = await supabase.auth.getUser();
      
      // assigned_to muss ein Array sein (DB-Spalte ist uuid[])
      const assignedTo = Array.isArray(task.assigned_to) 
        ? task.assigned_to 
        : task.assigned_to ? [task.assigned_to] : employeeId ? [employeeId] : [];
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          assigned_to: assignedTo,
          company_id: companyId,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Event emittieren
      await emitEvent(
        'task.created',
        'task',
        data.id,
        'tasks',
        {
          title: task.title,
          priority: task.priority,
          status: task.status,
          assigned_to: assignedTo,
          employee_context: employeeId
        }
      );
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      toast.success('Aufgabe erstellt');
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      toast.error(`Fehler beim Erstellen der Aufgabe: ${error.message}`);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      // Hole aktuellen Zustand für Event-Vergleich
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('status, assigned_to, due_date')
        .eq('id', taskId)
        .single();

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Spezifische Events emittieren
      if (currentTask) {
        // Status-Änderung
        if (updates.status && updates.status !== currentTask.status) {
          await emitEvent(
            'task.status_changed',
            'task',
            taskId,
            'tasks',
            {
              old_status: currentTask.status,
              new_status: updates.status
            }
          );
        }

        // Assignee-Änderung
        if (updates.assigned_to && updates.assigned_to !== currentTask.assigned_to) {
          await emitEvent(
            'task.assigned',
            'task',
            taskId,
            'tasks',
            {
              old_assignee: currentTask.assigned_to,
              new_assignee: updates.assigned_to
            }
          );
        }

        // Due-Date-Änderung
        if (updates.due_date && updates.due_date !== currentTask.due_date) {
          await emitEvent(
            'task.due_date_changed',
            'task',
            taskId,
            'tasks',
            {
              old_due_date: currentTask.due_date,
              new_due_date: updates.due_date
            }
          );
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      toast.success('Aufgabe aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      toast.success('Aufgabe gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          progress: 100,
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      // Event emittieren
      await emitEvent(
        'task.completed',
        'task',
        taskId,
        'tasks',
        { completed_date: new Date().toISOString() }
      );
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      toast.success('Aufgabe abgeschlossen');
    },
    onError: (error) => {
      console.error('Error completing task:', error);
      toast.error('Fehler beim Abschließen');
    },
  });

  const statistics = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
  };

  return {
    tasks,
    isLoading,
    statistics,
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
    completeTask: completeTask.mutateAsync,
  };
};
