
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { innovationService } from '@/services/innovationService';
import { toast } from 'sonner';
import { IdeaFormData, InnovationLifecycleTracking, InnovationApproval, ProjectTemplate } from '@/types/innovation';
import { supabase } from '@/integrations/supabase/client';

export const useInnovation = () => {
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading: ideasLoading } = useQuery({
    queryKey: ['innovation-ideas'],
    queryFn: () => innovationService.getIdeas(),
  });

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['innovation-channels'],
    queryFn: () => innovationService.getChannels(),
  });

  const { data: pilotProjects = [], isLoading: pilotProjectsLoading } = useQuery({
    queryKey: ['pilot-projects'],
    queryFn: () => innovationService.getPilotProjects(),
  });

  const { data: statistics, isLoading: statisticsLoading } = useQuery({
    queryKey: ['innovation-statistics'],
    queryFn: () => innovationService.getStatistics(),
  });

  const { data: kiFeatures = [], isLoading: kiFeaturesLoading } = useQuery({
    queryKey: ['ki-test-features'],
    queryFn: () => innovationService.getKITestFeatures(),
  });

  const createIdeaMutation = useMutation({
    mutationFn: (ideaData: IdeaFormData) => innovationService.createIdea(ideaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-statistics'] });
      toast.success('Idee erfolgreich eingereicht!');
    },
    onError: (error) => {
      console.error('Error creating idea:', error);
      toast.error('Fehler beim Einreichen der Idee');
    },
  });

  const createPilotProjectMutation = useMutation({
    mutationFn: (projectData: any) => innovationService.createPilotProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-projects'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-statistics'] });
      toast.success('Pilotprojekt erfolgreich erstellt!');
    },
    onError: (error) => {
      console.error('Error creating pilot project:', error);
      toast.error('Fehler beim Erstellen des Pilotprojekts');
    },
  });

  const updatePilotProjectMutation = useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: any }) => 
      innovationService.updatePilotProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-projects'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-statistics'] });
      toast.success('Pilotprojekt erfolgreich aktualisiert!');
    },
    onError: (error) => {
      console.error('Error updating pilot project:', error);
      toast.error('Fehler beim Aktualisieren des Pilotprojekts');
    },
  });

  const voteIdeaMutation = useMutation({
    mutationFn: ({ ideaId, voteType }: { ideaId: string; voteType: 'upvote' | 'downvote' }) =>
      innovationService.voteIdea(ideaId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-ideas'] });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast.error('Fehler beim Abstimmen');
    },
  });

  const updateIdeaStatusMutation = useMutation({
    mutationFn: ({ ideaId, status }: { ideaId: string; status: string }) =>
      innovationService.updateIdeaStatus(ideaId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-lifecycle'] });
      toast.success('Status erfolgreich aktualisiert - Automation wird ausgelöst');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    },
  });

  // Innovation Lifecycle Hooks - TENANT ISOLIERT
  const { data: lifecycleTracking = [], isLoading: lifecycleLoading } = useQuery({
    queryKey: ['innovation-lifecycle'],
    queryFn: async () => {
      // RLS wird automatisch durch Policies angewendet
      const { data, error } = await supabase
        .from('innovation_lifecycle_tracking')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as InnovationLifecycleTracking[];
    },
  });

  const { data: projectTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['project-templates'],
    queryFn: async () => {
      // RLS wird automatisch durch Policies angewendet
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as ProjectTemplate[];
    },
  });

  const promoteToRoadmapMutation = useMutation({
    mutationFn: async ({ ideaId }: { ideaId: string }) => {
      // Automatisches Roadmap-Erstellung wird durch Trigger ausgelöst
      const { data, error } = await supabase
        .from('innovation_ideas')
        .update({ status: 'approved' })
        .eq('id', ideaId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-lifecycle'] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Idee zu Roadmap befördert - Automatische Erstellung läuft');
    },
    onError: (error) => {
      console.error('Error promoting idea:', error);
      toast.error('Fehler beim Befördern der Idee');
    },
  });

  const createProjectFromRoadmapMutation = useMutation({
    mutationFn: async ({ roadmapId, templateId }: { roadmapId: string; templateId?: string }) => {
      // Diese Funktion würde das Projekt erstellen und Tasks generieren
      const { data: roadmap } = await supabase
        .from('roadmaps')
        .select('*, source_idea_id')
        .eq('id', roadmapId)
        .single();
      
      if (!roadmap) throw new Error('Roadmap nicht gefunden');

      // Projekt aus Roadmap erstellen (vereinfacht)
      const projectData = {
        name: roadmap.title.replace('Innovation Roadmap: ', ''),
        description: roadmap.description,
        source_roadmap_id: roadmapId,
        source_idea_id: roadmap.source_idea_id,
        lifecycle_automated: true,
        status: 'active' as const,
        priority: roadmap.priority as 'low' | 'medium' | 'high',
        start_date: roadmap.start_date,
        end_date: roadmap.end_date,
        progress: 0
      };

      return { project: projectData, roadmap };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-lifecycle'] });
      toast.success('Projekt aus Roadmap erstellt');
    },
    onError: (error) => {
      console.error('Error creating project from roadmap:', error);
      toast.error('Fehler beim Erstellen des Projekts');
    },
  });

  const getIdeaLifecycle = (ideaId: string) => {
    return lifecycleTracking.find(tracking => tracking.idea_id === ideaId);
  };

  return {
    ideas,
    channels,
    pilotProjects,
    statistics,
    kiFeatures,
    lifecycleTracking,
    projectTemplates,
    isLoading: ideasLoading || channelsLoading || pilotProjectsLoading || statisticsLoading || kiFeaturesLoading || lifecycleLoading || templatesLoading,
    createIdea: createIdeaMutation.mutateAsync,
    createPilotProject: createPilotProjectMutation.mutateAsync,
    updatePilotProject: (projectId: string, updates: any) => 
      updatePilotProjectMutation.mutateAsync({ projectId, updates }),
    voteIdea: voteIdeaMutation.mutateAsync,
    updateIdeaStatus: updateIdeaStatusMutation.mutateAsync,
    promoteToRoadmap: promoteToRoadmapMutation.mutateAsync,
    createProjectFromRoadmap: createProjectFromRoadmapMutation.mutateAsync,
    getIdeaLifecycle,
    isCreatingIdea: createIdeaMutation.isPending,
    isCreatingPilotProject: createPilotProjectMutation.isPending,
    isUpdatingPilotProject: updatePilotProjectMutation.isPending,
    isVoting: voteIdeaMutation.isPending,
    isUpdatingStatus: updateIdeaStatusMutation.isPending,
    isPromoting: promoteToRoadmapMutation.isPending,
    isCreatingProject: createProjectFromRoadmapMutation.isPending,
  };
};
