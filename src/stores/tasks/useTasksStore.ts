
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/tasks';
import { emitEvent } from '@/services/eventEmitterService';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  archiveTask: (id: string) => Promise<boolean>;
  batchUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<boolean>;
  batchDeleteTasks: (taskIds: string[]) => Promise<boolean>;
  batchArchiveTasks: (taskIds: string[]) => Promise<boolean>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Hole aktuelle Session für User-ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Hole Mitarbeiter-ID des aktuellen Benutzers
      let employeeId: string | null = null;
      if (userId) {
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        employeeId = employee?.id || null;
      }

      // Query mit Filter: Nur Aufgaben wo der Benutzer zugewiesen ist oder erstellt hat
      let query = supabase
        .from('tasks')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      // Filter auf eigene Aufgaben (assigned_to enthält die User-ID oder Employee-ID)
      if (userId && employeeId) {
        query = query.or(`assigned_to.cs.{${userId}},assigned_to.cs.{${employeeId}},created_by.eq.${userId}`);
      } else if (userId) {
        query = query.or(`assigned_to.cs.{${userId}},created_by.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform database data to match Task interface
      const transformedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.due_date || undefined,
        reminderDate: task.reminder_date || undefined,
        completed: task.completed || false,
        assignedTo: task.assigned_to || [],
        tags: task.tags || [],
        progress: task.progress || 0,
        timeLogged: task.time_logged || 0,
        dependencies: task.dependencies || [],
        createdAt: task.created_at || new Date().toISOString(),
        updatedAt: task.updated_at || new Date().toISOString(),
        createdBy: task.created_by || undefined,
        projectId: task.project_id || undefined,
        autoTimeTracking: task.auto_time_tracking || false,
        notes: task.notes || ''
      }));

      set({ tasks: transformedTasks, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Aufgaben:', error);
      set({ error: 'Fehler beim Laden der Aufgaben', isLoading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      // Session prüfen für Auth-Check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Nicht angemeldet');
      }

      // Company-ID über RPC ermitteln
      const { data: companyId, error: companyError } = await supabase.rpc('get_effective_company_id');
      
      if (companyError || !companyId) {
        console.error('Keine Firma zugeordnet:', companyError);
        throw new Error('Keine Firma zugeordnet. Bitte kontaktiere den Administrator.');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          reminder_date: taskData.reminderDate,
          assigned_to: taskData.assignedTo,
          tags: taskData.tags,
          progress: taskData.progress,
          project_id: taskData.projectId,
          auto_time_tracking: taskData.autoTimeTracking,
          notes: taskData.notes,
          company_id: companyId
        }])
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
          title: taskData.title,
          priority: taskData.priority,
          status: taskData.status,
          assigned_to: taskData.assignedTo,
          due_date: taskData.dueDate,
          project_id: taskData.projectId
        }
      );

      // Refresh tasks after adding
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      set({ error: 'Fehler beim Erstellen der Aufgabe' });
      return false;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.dueDate,
          reminder_date: updates.reminderDate,
          assigned_to: updates.assignedTo,
          tags: updates.tags,
          progress: updates.progress,
          project_id: updates.projectId,
          auto_time_tracking: updates.autoTimeTracking,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Event emittieren
      await emitEvent(
        'task.updated',
        'task',
        id,
        'tasks',
        {
          updated_fields: Object.keys(updates),
          new_status: updates.status,
          new_priority: updates.priority
        }
      );

      // Refresh tasks after updating
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      set({ error: 'Fehler beim Aktualisieren der Aufgabe' });
      return false;
    }
  },

  deleteTask: async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', id);

      if (error) throw error;

      // Event emittieren
      await emitEvent(
        'task.deleted',
        'task',
        id,
        'tasks',
        { soft_delete: true }
      );

      // Refresh tasks after deleting
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error);
      set({ error: 'Fehler beim Löschen der Aufgabe' });
      return false;
    }
  },

  archiveTask: async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;

      // Refresh tasks after archiving
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Archivieren der Aufgabe:', error);
      set({ error: 'Fehler beim Archivieren der Aufgabe' });
      return false;
    }
  },

  batchUpdateTasks: async (taskIds, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.dueDate,
          reminder_date: updates.reminderDate,
          assigned_to: updates.assignedTo,
          tags: updates.tags,
          progress: updates.progress,
          project_id: updates.projectId,
          auto_time_tracking: updates.autoTimeTracking,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds);

      if (error) throw error;

      // Refresh tasks after batch updating
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Batch-Update der Aufgaben:', error);
      set({ error: 'Fehler beim Batch-Update der Aufgaben' });
      return false;
    }
  },

  batchDeleteTasks: async (taskIds) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds);

      if (error) throw error;

      // Refresh tasks after batch deleting
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Batch-Löschen der Aufgaben:', error);
      set({ error: 'Fehler beim Batch-Löschen der Aufgaben' });
      return false;
    }
  },

  batchArchiveTasks: async (taskIds) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds);

      if (error) throw error;

      // Refresh tasks after batch archiving
      await get().fetchTasks();
      return true;
    } catch (error) {
      console.error('Fehler beim Batch-Archivieren der Aufgaben:', error);
      set({ error: 'Fehler beim Batch-Archivieren der Aufgaben' });
      return false;
    }
  }
}));
