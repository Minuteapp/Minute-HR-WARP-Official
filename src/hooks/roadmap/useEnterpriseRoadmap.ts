
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  StrategicTheme, 
  Program, 
  RoadmapVersion, 
  RoadmapRisk, 
  RoadmapApproval,
  RoadmapComment,
  RoadmapPrediction,
  EnterpriseRoadmapData 
} from '@/types/enterprise-roadmap.types';

export const useEnterpriseRoadmap = (roadmapId: string) => {
  const queryClient = useQueryClient();

  // Strategic Themes
  const strategicThemesQuery = useQuery({
    queryKey: ['strategic-themes', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StrategicTheme[];
    }
  });

  // Programs
  const programsQuery = useQuery({
    queryKey: ['programs', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          strategic_themes:strategic_theme_id(name, color),
          program_projects(
            project_id,
            projects(name, status, progress)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Program[];
    }
  });

  // Roadmap Versions für What-If Szenarien
  const versionsQuery = useQuery({
    queryKey: ['roadmap-versions', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_versions')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as RoadmapVersion[];
    }
  });

  // Risks
  const risksQuery = useQuery({
    queryKey: ['roadmap-risks', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_risks')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('risk_score', { ascending: false });

      if (error) throw error;
      return data as RoadmapRisk[];
    }
  });

  // Approvals
  const approvalsQuery = useQuery({
    queryKey: ['roadmap-approvals', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_approvals')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as RoadmapApproval[];
    }
  });

  // Comments
  const commentsQuery = useQuery({
    queryKey: ['roadmap-comments', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_comments')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RoadmapComment[];
    }
  });

  // Predictions
  const predictionsQuery = useQuery({
    queryKey: ['roadmap-predictions', roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_predictions')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .eq('is_active', true)
        .order('prediction_confidence', { ascending: false });

      if (error) throw error;
      return data as RoadmapPrediction[];
    }
  });

  // Strategic Theme Mutations
  const createStrategicTheme = useMutation({
    mutationFn: async (themeData: Omit<StrategicTheme, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { data, error } = await supabase
        .from('strategic_themes')
        .insert({
          ...themeData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-themes'] });
      toast.success('Strategisches Thema erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Erstellen des strategischen Themas: ${error.message}`);
    }
  });

  // Program Mutations
  const createProgram = useMutation({
    mutationFn: async (programData: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { data, error } = await supabase
        .from('programs')
        .insert({
          ...programData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Programm erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Erstellen des Programms: ${error.message}`);
    }
  });

  // What-If Scenario Creation
  const createWhatIfScenario = useMutation({
    mutationFn: async (versionData: Omit<RoadmapVersion, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { data, error } = await supabase
        .from('roadmap_versions')
        .insert({
          ...versionData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-versions'] });
      toast.success('What-If Szenario erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Erstellen des Szenarios: ${error.message}`);
    }
  });

  // Risk Management
  const createRisk = useMutation({
    mutationFn: async (riskData: Omit<RoadmapRisk, 'id' | 'created_at' | 'updated_at' | 'risk_score'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { data, error } = await supabase
        .from('roadmap_risks')
        .insert({
          ...riskData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-risks'] });
      toast.success('Risiko erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Erstellen des Risikos: ${error.message}`);
    }
  });

  // Approval Workflow
  const requestApproval = useMutation({
    mutationFn: async (approvalData: Omit<RoadmapApproval, 'id' | 'requested_at' | 'responded_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const { data, error } = await supabase
        .from('roadmap_approvals')
        .insert({
          ...approvalData,
          requested_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-approvals'] });
      toast.success('Genehmigungsantrag erfolgreich gestellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Stellen des Genehmigungsantrags: ${error.message}`);
    }
  });

  return {
    // Data
    strategicThemes: strategicThemesQuery.data || [],
    programs: programsQuery.data || [],
    versions: versionsQuery.data || [],
    risks: risksQuery.data || [],
    approvals: approvalsQuery.data || [],
    comments: commentsQuery.data || [],
    predictions: predictionsQuery.data || [],
    
    // Loading states
    isLoading: strategicThemesQuery.isLoading || programsQuery.isLoading,
    
    // Mutations
    createStrategicTheme,
    createProgram,
    createWhatIfScenario,
    createRisk,
    requestApproval,
    
    // Helper functions
    getHighRiskItems: () => risksQuery.data?.filter(risk => risk.risk_score >= 15) || [],
    getPendingApprovals: () => approvalsQuery.data?.filter(approval => approval.approval_status === 'pending') || [],
    getActivePrograms: () => programsQuery.data?.filter(program => program.status === 'active') || []
  };
};
