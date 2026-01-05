import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project.types';
import { useState } from 'react';
import { toast } from 'sonner';
import { emitEvent } from '@/services/eventEmitterService';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showArchivedOrTrash] = useState(false);

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        console.log('Fetching projects from database...');
        
        // Einfache Abfrage ohne JOIN - project_categories separat laden wenn nötig
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching projects:', error);
          throw error;
        }
        
        console.log('Projects fetched successfully:', data?.length || 0, data);
        return (data || []) as Project[];
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        // CLEAN INITIALIZATION: Keine Mock-Daten - leeres Array bei Fehler
        return [] as Project[];
      }
    },
    staleTime: 0, // Immer frische Daten holen
    refetchOnWindowFocus: true,
  });

  const createProject = useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log('CreateProject mutation called with:', projectData);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Benutzer nicht authentifiziert");
        }

        // Company-ID ermitteln über RPC (unterstützt Tenant-Modus)
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        let companyId = userRole?.company_id || null;
        
        // Fallback: RPC-Funktion für effective company_id (Tenant-Modus)
        if (!companyId) {
          const { data: rpcCompanyId } = await supabase.rpc('get_effective_company_id');
          companyId = rpcCompanyId;
        }
        
        if (!companyId) {
          throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
        }

        // Vereinfache die Projektdaten für die Datenbank
        const dbProjectData = {
          name: projectData.name?.trim() || '',
          description: projectData.description?.trim() || '',
          start_date: projectData.start_date || null,
          end_date: projectData.end_date || null,
          status: 'pending', // Verwende immer einen gültigen Status
          priority: projectData.priority || 'medium',
          budget: projectData.budget || null,
          currency: projectData.currency || 'EUR',
          project_type: projectData.project_type || 'standard',
          owner_id: user.id,
          company_id: companyId,
          team_members: projectData.team_members || [],
          tags: projectData.tags || [],
          progress: 0,
          visibility: 'internal',
          is_template: false
        };

        console.log('Inserting project with data:', dbProjectData);

        const { data, error } = await supabase
          .from('projects')
          .insert([dbProjectData])
          .select()
          .single();
        
        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }
        
        if (!data) {
          throw new Error('Keine Daten vom Server erhalten');
        }
        
        console.log('Project created successfully:', data);
        
        // Event emittieren
        await emitEvent(
          'project.created',
          'project',
          data.id,
          'projects',
          {
            name: data.name,
            status: data.status,
            priority: data.priority,
            owner_id: data.owner_id,
            budget: data.budget
          }
        );
        
        return data;
      } catch (error: any) {
        console.error('Error in createProject mutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Project creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projekt erfolgreich erstellt');
    },
    onError: (error: any) => {
      console.error('Project creation failed:', error);
      let errorMessage = 'Fehler beim Erstellen des Projekts';
      
      if (error?.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage);
    }
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      try {
        console.log('Updating project:', id, updates);
        
        const { data, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        
        // Event emittieren
        await emitEvent(
          'project.updated',
          'project',
          id,
          'projects',
          { updated_fields: Object.keys(updates) }
        );
        
        return data;
      } catch (error: any) {
        console.error('Error updating project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projekt erfolgreich aktualisiert');
    },
    onError: (error: any) => {
      console.error('Project update failed:', error);
      toast.error('Fehler beim Aktualisieren des Projekts');
    }
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Event emittieren
        await emitEvent(
          'project.deleted',
          'project',
          id,
          'projects',
          {}
        );
      } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projekt erfolgreich gelöscht');
    },
    onError: (error: any) => {
      console.error('Project deletion failed:', error);
      toast.error('Fehler beim Löschen des Projekts');
    }
  });

  const updateProjectStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Event emittieren
      await emitEvent(
        'project.status_changed',
        'project',
        id,
        'projects',
        { new_status: status }
      );
      
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projektstatus erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Fehler beim Aktualisieren des Projektstatus');
    }
  };

  const refreshProjects = async () => {
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
    await refetch();
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      refreshProjects();
      toast.success('Projekt erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Fehler beim Löschen des Projekts');
    }
  };

  const moveToArchive = async (id: string) => {
    await updateProjectStatus(id, 'archived');
  };

  const moveToTrash = async (id: string) => {
    await updateProjectStatus(id, 'archived');
  };

  return {
    projects,
    isLoading,
    loading: isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    refreshProjects,
    handleDelete,
    moveToArchive,
    moveToTrash,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    showArchivedOrTrash,
  };
};
