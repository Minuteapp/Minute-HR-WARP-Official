import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Roadmap } from './useRoadmaps';

export interface RoadmapMilestone {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  progress?: number;
  dependencies?: string[];
}

export interface RoadmapGoal {
  id: string;
  title: string;
  description?: string;
  status: string;
  target_value?: number;
  current_value?: number;
}

export interface RoadmapRisk {
  id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  mitigation?: string;
}

export interface RoadmapComment {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  author_name?: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface RoadmapDetail extends Roadmap {
  milestones: RoadmapMilestone[];
  goals: RoadmapGoal[];
  risks: RoadmapRisk[];
  comments: RoadmapComment[];
  team_members: TeamMember[];
  projects: any[];
  team_name?: string;
  metadata?: Record<string, any>;
}

export const useRoadmapDetail = (roadmapId: string | undefined) => {
  return useQuery({
    queryKey: ['roadmap-detail', roadmapId],
    queryFn: async (): Promise<RoadmapDetail | null> => {
      if (!roadmapId) return null;

      // Roadmap laden
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('id', roadmapId)
        .single();

      if (roadmapError) throw roadmapError;
      if (!roadmap) return null;

      // Meilensteine laden
      const { data: milestones } = await supabase
        .from('roadmap_milestones')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('due_date', { ascending: true });

      // Ziele laden
      const { data: goals } = await supabase
        .from('roadmap_goals')
        .select('*')
        .eq('roadmap_id', roadmapId);

      // Risiken laden
      const { data: risks } = await supabase
        .from('roadmap_risks')
        .select('*')
        .eq('roadmap_id', roadmapId);

      // Kommentare laden
      const { data: comments } = await supabase
        .from('roadmap_comments')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('created_at', { ascending: false });

      // Team-Mitglieder laden (falls team_id vorhanden)
      let teamMembers: TeamMember[] = [];
      let teamName: string | undefined;
      
      if (roadmap.team_id) {
        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', roadmap.team_id)
          .single();
        
        teamName = team?.name;

        const { data: members } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            role,
            profiles:user_id(full_name, avatar_url)
          `)
          .eq('team_id', roadmap.team_id);

        if (members) {
          teamMembers = members.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role,
            full_name: m.profiles?.full_name,
            avatar_url: m.profiles?.avatar_url,
          }));
        }
      }

      // Projekte laden (verknüpft über roadmap_id oder metadata)
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status, progress, start_date, end_date')
        .eq('roadmap_id', roadmapId);

      // Parse metadata sicher
      let parsedMetadata: Record<string, any> = {};
      if (roadmap.metadata) {
        try {
          parsedMetadata = typeof roadmap.metadata === 'string' 
            ? JSON.parse(roadmap.metadata) 
            : roadmap.metadata;
        } catch {
          parsedMetadata = {};
        }
      }

      return {
        ...roadmap,
        milestones: milestones || [],
        goals: goals || [],
        risks: risks || [],
        comments: comments || [],
        team_members: teamMembers,
        projects: projects || [],
        team_name: teamName,
        metadata: parsedMetadata,
      } as RoadmapDetail;
    },
    enabled: !!roadmapId,
  });
};
