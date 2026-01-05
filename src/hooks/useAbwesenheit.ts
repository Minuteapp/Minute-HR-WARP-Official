import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeAbwesenheitsart, DeAbwesenheitsantrag, AbwesenheitsantragFormData } from '@/types/sprint1.types';
import { useToast } from '@/hooks/use-toast';

// Abwesenheitsarten Hook
export const useAbwesenheitsarten = () => {
  return useQuery({
    queryKey: ['de-abwesenheitsarten'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('de_abwesenheitsarten')
        .select('*')
        .eq('ist_aktiv', true)
        .order('name');
      
      if (error) throw error;
      return data as DeAbwesenheitsart[];
    },
  });
};

// Abwesenheitsanträge Hook
export const useAbwesenheitsantraege = () => {
  return useQuery({
    queryKey: ['de-abwesenheitsantraege'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('de_abwesenheitsantraege')
        .select(`
          *,
          abwesenheitsart:de_abwesenheitsarten(name, code, farbe, icon),
          mitarbeiter:employees!mitarbeiter_id(name, department),
          vertretung:employees!vertretung_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DeAbwesenheitsantrag[];
    },
  });
};

export const useAbwesenheitsantrag = (id: string) => {
  return useQuery({
    queryKey: ['de-abwesenheitsantrag', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('de_abwesenheitsantraege')
        .select(`
          *,
          abwesenheitsart:de_abwesenheitsarten(name, code, farbe, icon),
          mitarbeiter:employees!mitarbeiter_id(name, department),
          vertretung:employees!vertretung_id(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as DeAbwesenheitsantrag;
    },
    enabled: !!id,
  });
};

export const useCreateAbwesenheitsantrag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AbwesenheitsantragFormData) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Nicht angemeldet');

      // Berechne Tage
      const startDate = new Date(data.start_datum);
      const endDate = new Date(data.ende_datum);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 für inklusiv

      const { data: antrag, error } = await supabase
        .from('de_abwesenheitsantraege')
        .insert({
          ...data,
          mitarbeiter_id: user.data.user.id,
          tage_gesamt: data.halber_tag ? 0.5 : diffDays,
        })
        .select()
        .single();
      
      if (error) throw error;
      return antrag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['de-abwesenheitsantraege'] });
      toast({
        title: 'Abwesenheitsantrag erstellt',
        description: 'Ihr Antrag wurde erfolgreich eingereicht.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der Antrag konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      console.error('Create absence request error:', error);
    },
  });
};

export const useUpdateAbwesenheitsantrag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeAbwesenheitsantrag> }) => {
      const { data: antrag, error } = await supabase
        .from('de_abwesenheitsantraege')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return antrag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['de-abwesenheitsantraege'] });
      toast({
        title: 'Antrag aktualisiert',
        description: 'Der Antrag wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der Antrag konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      console.error('Update absence request error:', error);
    },
  });
};

export const useGenehmigenAbwesenheitsantrag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      kommentar 
    }: { 
      id: string; 
      kommentar?: string; 
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Nicht angemeldet');

      const { data: antrag, error } = await supabase
        .from('de_abwesenheitsantraege')
        .update({
          status: 'genehmigt',
          erster_genehmiger_id: user.data.user.id,
          erster_genehmiger_datum: new Date().toISOString(),
          erster_genehmiger_kommentar: kommentar,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return antrag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['de-abwesenheitsantraege'] });
      toast({
        title: 'Antrag genehmigt',
        description: 'Der Antrag wurde erfolgreich genehmigt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der Antrag konnte nicht genehmigt werden.',
        variant: 'destructive',
      });
      console.error('Approve absence request error:', error);
    },
  });
};

export const useAblehnenAbwesenheitsantrag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      grund 
    }: { 
      id: string; 
      grund: string; 
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Nicht angemeldet');

      const { data: antrag, error } = await supabase
        .from('de_abwesenheitsantraege')
        .update({
          status: 'abgelehnt',
          ablehnungsgrund: grund,
          erster_genehmiger_id: user.data.user.id,
          erster_genehmiger_datum: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return antrag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['de-abwesenheitsantraege'] });
      toast({
        title: 'Antrag abgelehnt',
        description: 'Der Antrag wurde abgelehnt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der Antrag konnte nicht abgelehnt werden.',
        variant: 'destructive',
      });
      console.error('Reject absence request error:', error);
    },
  });
};

// Statistics
export const useAbwesenheitsstatistik = () => {
  return useQuery({
    queryKey: ['abwesenheitsstatistik'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('de_abwesenheitsantraege')
        .select('status, tage_gesamt, start_datum, ende_datum');
      
      if (error) throw error;

      const stats = {
        gesamt: data.length,
        genehmigt: data.filter(a => a.status === 'genehmigt').length,
        ausstehend: data.filter(a => a.status === 'eingereicht').length,
        abgelehnt: data.filter(a => a.status === 'abgelehnt').length,
        tage_gesamt: data
          .filter(a => a.status === 'genehmigt')
          .reduce((sum, a) => sum + (a.tage_gesamt || 0), 0),
      };

      return stats;
    },
  });
};