import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Project {
  id: string;
  project_name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  deadline?: string;
  budget_total?: number;
  budget_spent: number;
  progress: number;
  project_lead_id?: string;
  department?: string;
  client_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  employee_id: string;
  role: 'lead' | 'member' | 'contributor' | 'observer';
  allocation_percentage: number;
  joined_date: string;
  left_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProjects = (employeeId?: string) => {
  const queryClient = useQueryClient();

  // Get projects where employee is a member
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['employee-projects', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          allocation_percentage,
          projects (*)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data.map((pm: any) => ({
        ...pm.projects,
        member_role: pm.role,
        allocation: pm.allocation_percentage,
      }));
    },
    enabled: !!employeeId,
  });

  const { data: allProjects = [], isLoading: allProjectsLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'budget_spent' | 'progress'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      queryClient.invalidateQueries({ queryKey: ['employee-projects'] });
      toast.success('Projekt erstellt');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Fehler beim Erstellen des Projekts');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      queryClient.invalidateQueries({ queryKey: ['employee-projects'] });
      toast.success('Projekt aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      queryClient.invalidateQueries({ queryKey: ['employee-projects'] });
      toast.success('Projekt gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  const addProjectMember = useMutation({
    mutationFn: async (member: Omit<ProjectMember, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('project_members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-projects'] });
      toast.success('Teammitglied hinzugefügt');
    },
    onError: (error) => {
      console.error('Error adding member:', error);
      toast.error('Fehler beim Hinzufügen');
    },
  });

  const removeProjectMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('project_members')
        .update({ is_active: false, left_date: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-projects'] });
      toast.success('Teammitglied entfernt');
    },
    onError: (error) => {
      console.error('Error removing member:', error);
      toast.error('Fehler beim Entfernen');
    },
  });

  return {
    projects,
    allProjects,
    isLoading: isLoading || allProjectsLoading,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
    addProjectMember: addProjectMember.mutateAsync,
    removeProjectMember: removeProjectMember.mutateAsync,
  };
};
