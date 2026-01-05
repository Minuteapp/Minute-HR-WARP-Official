import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectTask, TaskFormData, TaskFilter } from '@/types/projects';

export const useTasks = (projectId?: string, filters?: TaskFilter) => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from('project_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assignee?.length) {
        query = query.overlaps('assignees', filters.assignee);
      }
      if (filters?.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }
      if (filters?.tags?.length) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data as ProjectTask[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createTask = useMutation({
    mutationFn: async ({ projectId, taskData }: { projectId: string; taskData: TaskFormData }) => {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([{
          project_id: projectId,
          title: taskData.title,
          description: taskData.description,
          assignees: taskData.assignees || [],
          due_date: taskData.due_date,
          start_date: taskData.start_date,
          estimate_hours: taskData.estimate_hours || 0,
          spent_hours: 0,
          status: 'todo',
          priority: taskData.priority || 'medium',
          progress: 0,
          dependencies: taskData.dependencies || [],
          tags: taskData.tags || [],
          attachments: [],
          location: taskData.location,
          skill_requirements: taskData.skill_requirements || [],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erstellt');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Fehler beim Erstellen der Aufgabe');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectTask> }) => {
      const { data: result, error } = await supabase
        .from('project_tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Fehler beim Löschen der Aufgabe');
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
  };
};

export const useTask = (id: string) => {
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProjectTask;
    },
    enabled: !!id,
  });

  return { task, isLoading, error };
};

export const useTasksByAssignee = (userId: string) => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-by-assignee', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*, projects!inner(name)')
        .contains('assignees', [userId])
        .in('status', ['todo', 'in_progress', 'review'])
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { tasks, isLoading };
};