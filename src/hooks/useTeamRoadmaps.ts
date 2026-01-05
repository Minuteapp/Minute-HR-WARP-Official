import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamRoadmap {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  progress: number;
  created_at: string;
  team_id?: string;
  visibility?: string;
  owner_id?: string;
  team?: {
    id: string;
    name: string;
    department_id?: string;
  };
}

export interface TeamWithRoadmaps {
  id: string;
  name: string;
  roadmaps: TeamRoadmap[];
  activeCount: number;
}

export const useTeamRoadmaps = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-roadmaps', user?.id],
    queryFn: async () => {
      if (!user) return { roadmaps: [], teamsWithRoadmaps: [], totalRoadmaps: 0, totalTeams: 0 };

      // Lade Teams des Benutzers
      const { data: userTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const userTeamIds = userTeams?.map(t => t.team_id) || [];

      // Lade Roadmaps mit Team-Informationen
      const { data: roadmaps, error } = await supabase
        .from('roadmaps')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          start_date,
          end_date,
          progress,
          created_at,
          team_id,
          visibility,
          owner_id,
          created_by
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Lade alle Teams
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, department_id')
        .order('name');

      const teamsMap = new Map(teams?.map(t => [t.id, t]) || []);

      // Füge Team-Info zu Roadmaps hinzu
      const roadmapsWithTeams = (roadmaps || []).map(r => ({
        ...r,
        team: r.team_id ? teamsMap.get(r.team_id) : undefined
      }));

      // Gruppiere nach Teams
      const teamRoadmapsMap = new Map<string, TeamRoadmap[]>();
      const unassignedRoadmaps: TeamRoadmap[] = [];

      roadmapsWithTeams.forEach(roadmap => {
        if (roadmap.team_id) {
          const existing = teamRoadmapsMap.get(roadmap.team_id) || [];
          existing.push(roadmap as TeamRoadmap);
          teamRoadmapsMap.set(roadmap.team_id, existing);
        } else {
          unassignedRoadmaps.push(roadmap as TeamRoadmap);
        }
      });

      // Erstelle Teams mit Roadmaps Array
      const teamsWithRoadmaps: TeamWithRoadmaps[] = [];
      
      teams?.forEach(team => {
        const teamRoadmaps = teamRoadmapsMap.get(team.id) || [];
        if (teamRoadmaps.length > 0) {
          teamsWithRoadmaps.push({
            id: team.id,
            name: team.name,
            roadmaps: teamRoadmaps,
            activeCount: teamRoadmaps.filter(r => r.status === 'active').length
          });
        }
      });

      // Füge "Nicht zugeordnet" hinzu falls vorhanden
      if (unassignedRoadmaps.length > 0) {
        teamsWithRoadmaps.push({
          id: 'unassigned',
          name: 'Nicht zugeordnet',
          roadmaps: unassignedRoadmaps,
          activeCount: unassignedRoadmaps.filter(r => r.status === 'active').length
        });
      }

      return {
        roadmaps: roadmapsWithTeams as TeamRoadmap[],
        teamsWithRoadmaps,
        totalRoadmaps: roadmapsWithTeams.length,
        totalTeams: teamsWithRoadmaps.filter(t => t.id !== 'unassigned').length
      };
    },
    enabled: !!user
  });
};
