import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  InnovationHubSettings,
  InnovationChallenge,
  InnovationEvaluationCriterion,
  InnovationPermission,
  defaultInnovationHubSettings,
} from '@/types/innovation-settings';

// ========== INNOVATION HUB SETTINGS ==========

export function useInnovationHubSettings(companyId?: string) {
  return useQuery({
    queryKey: ['innovation-hub-settings', companyId],
    queryFn: async () => {
      let query = supabase.from('innovation_hub_settings').select('*');
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as InnovationHubSettings | null;
    },
  });
}

export function useUpdateInnovationHubSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      settings,
    }: {
      id?: string;
      settings: Partial<InnovationHubSettings>;
    }) => {
      if (id) {
        const { data, error } = await supabase
          .from('innovation_hub_settings')
          .update(settings as any)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('innovation_hub_settings')
          .insert(settings as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-hub-settings'] });
      toast.success('Innovation-Einstellungen gespeichert');
    },
    onError: (error) => {
      console.error('Error saving innovation settings:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    },
  });
}

// ========== INNOVATION CHALLENGES ==========

export function useInnovationChallenges(companyId?: string) {
  return useQuery({
    queryKey: ['innovation-challenges', companyId],
    queryFn: async () => {
      let query = supabase.from('innovation_challenges').select('*').order('created_at', { ascending: false });
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as InnovationChallenge[];
    },
  });
}

export function useCreateInnovationChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challenge: Partial<InnovationChallenge>) => {
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }
      
      const { data, error } = await supabase
        .from('innovation_challenges')
        .insert({ ...challenge, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-challenges'] });
      toast.success('Challenge erstellt');
    },
    onError: (error) => {
      console.error('Error creating challenge:', error);
      toast.error('Fehler beim Erstellen der Challenge');
    },
  });
}

export function useUpdateInnovationChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, challenge }: { id: string; challenge: Partial<InnovationChallenge> }) => {
      const { data, error } = await supabase
        .from('innovation_challenges')
        .update(challenge as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-challenges'] });
      toast.success('Challenge aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating challenge:', error);
      toast.error('Fehler beim Aktualisieren der Challenge');
    },
  });
}

export function useDeleteInnovationChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('innovation_challenges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-challenges'] });
      toast.success('Challenge gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting challenge:', error);
      toast.error('Fehler beim Löschen der Challenge');
    },
  });
}

// ========== EVALUATION CRITERIA ==========

export function useInnovationEvaluationCriteria(companyId?: string) {
  return useQuery({
    queryKey: ['innovation-evaluation-criteria', companyId],
    queryFn: async () => {
      let query = supabase
        .from('innovation_evaluation_criteria')
        .select('*')
        .order('sort_order', { ascending: true });
      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as InnovationEvaluationCriterion[];
    },
  });
}

export function useCreateEvaluationCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (criterion: Partial<InnovationEvaluationCriterion>) => {
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }
      
      const { data, error } = await supabase
        .from('innovation_evaluation_criteria')
        .insert({ ...criterion, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-evaluation-criteria'] });
      toast.success('Bewertungskriterium erstellt');
    },
    onError: (error) => {
      console.error('Error creating criterion:', error);
      toast.error('Fehler beim Erstellen des Kriteriums');
    },
  });
}

export function useUpdateEvaluationCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, criterion }: { id: string; criterion: Partial<InnovationEvaluationCriterion> }) => {
      const { data, error } = await supabase
        .from('innovation_evaluation_criteria')
        .update(criterion as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-evaluation-criteria'] });
      toast.success('Bewertungskriterium aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating criterion:', error);
      toast.error('Fehler beim Aktualisieren des Kriteriums');
    },
  });
}

export function useDeleteEvaluationCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('innovation_evaluation_criteria').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-evaluation-criteria'] });
      toast.success('Bewertungskriterium gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting criterion:', error);
      toast.error('Fehler beim Löschen des Kriteriums');
    },
  });
}

// ========== PERMISSIONS ==========

export function useInnovationPermissions(companyId?: string) {
  return useQuery({
    queryKey: ['innovation-permissions', companyId],
    queryFn: async () => {
      let query = supabase.from('innovation_permissions').select('*');
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as InnovationPermission[];
    },
  });
}

export function useUpsertInnovationPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permission: Partial<InnovationPermission>) => {
      const { data, error } = await supabase
        .from('innovation_permissions')
        .upsert(permission as any, { onConflict: 'company_id,role_type' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['innovation-permissions'] });
      toast.success('Berechtigung gespeichert');
    },
    onError: (error) => {
      console.error('Error saving permission:', error);
      toast.error('Fehler beim Speichern der Berechtigung');
    },
  });
}
