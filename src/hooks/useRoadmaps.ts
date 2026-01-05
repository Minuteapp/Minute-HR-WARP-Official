import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  vision?: string;
  mission?: string;
  status: 'draft' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  progress: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  // Team & Visibility Extensions
  team_id?: string;
  visibility?: 'private' | 'team' | 'department' | 'company';
  owner_id?: string;
  // Innovation Lifecycle Extensions
  source_idea_id?: string;
  auto_created?: boolean;
  // Legacy compatibility fields
  strategic_objectives?: any[];
  milestones?: any[];
}

export const useRoadmaps = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      // RLS wird automatisch durch Policies angewendet
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*, source_idea_id, auto_created, team_id, visibility, owner_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Roadmap[];
    }
  });

  const createRoadmap = useMutation({
    mutationFn: async (roadmapData: Omit<Roadmap, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'progress'>) => {
      if (!user) throw new Error('Nicht authentifiziert');

      // company_id über RPC-Funktion ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');

      if (!companyId) {
        throw new Error('Keine Firma zugeordnet. Bitte wählen Sie einen Tenant aus.');
      }

      // Status normalisieren für DB-Constraint (nur draft, active, archived erlaubt)
      let dbStatus: 'draft' | 'active' | 'archived' = 'draft';
      if (roadmapData.status === 'active') {
        dbStatus = 'active';
      } else if (roadmapData.status === 'completed' || roadmapData.status === 'on_hold' || roadmapData.status === 'cancelled') {
        dbStatus = 'archived';
      }

      // Clean up empty date strings and convert them to null
      const cleanedData = {
        ...roadmapData,
        status: dbStatus,
        start_date: roadmapData.start_date?.trim() || null,
        end_date: roadmapData.end_date?.trim() || null,
        team_id: (roadmapData as any).team_id?.trim() || null,
        visibility: (roadmapData as any).visibility || 'team',
        created_by: user.id,
        owner_id: user.id,
        progress: 0,
        company_id: companyId
      };

      const { data, error } = await supabase
        .from('roadmaps')
        .insert(cleanedData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Erstellen der Roadmap: ${error.message}`);
    }
  });

  const updateRoadmap = useMutation({
    mutationFn: async ({ id, ...roadmapData }: Partial<Roadmap> & { id: string }) => {
      // Clean up empty date strings and convert them to null
      const cleanedData = { ...roadmapData };
      if ('start_date' in cleanedData) {
        cleanedData.start_date = cleanedData.start_date?.trim() || null;
      }
      if ('end_date' in cleanedData) {
        cleanedData.end_date = cleanedData.end_date?.trim() || null;
      }

      const { data, error } = await supabase
        .from('roadmaps')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap erfolgreich aktualisiert');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Aktualisieren der Roadmap: ${error.message}`);
    }
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap erfolgreich gelöscht');
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Löschen der Roadmap: ${error.message}`);
    }
  });

  return {
    roadmaps: roadmapsQuery.data || [],
    isLoading: roadmapsQuery.isLoading,
    error: roadmapsQuery.error,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap
  };
};
