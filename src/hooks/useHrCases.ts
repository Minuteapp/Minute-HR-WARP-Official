import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HrCase, HrCaseFormData } from '@/types/sprint1.types';
import { useToast } from '@/hooks/use-toast';

export const useHrCases = () => {
  return useQuery({
    queryKey: ['hr-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_cases')
        .select(`
          *,
          employee:employees!employee_id(name, department),
          reporter:employees!reporter_id(name),
          assigned:employees!assigned_to(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as HrCase[];
    },
  });
};

export const useHrCase = (id: string) => {
  return useQuery({
    queryKey: ['hr-case', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_cases')
        .select(`
          *,
          employee:employees!employee_id(name, department),
          reporter:employees!reporter_id(name),
          assigned:employees!assigned_to(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as HrCase;
    },
    enabled: !!id,
  });
};

export const useCreateHrCase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: HrCaseFormData) => {
      const { data: hrCase, error } = await supabase
        .from('hr_cases')
        .insert({
          ...data,
          reporter_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return hrCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-cases'] });
      toast({
        title: 'HR Fall erstellt',
        description: 'Der HR Fall wurde erfolgreich erstellt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der HR Fall konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      console.error('Create HR case error:', error);
    },
  });
};

export const useUpdateHrCase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HrCase> }) => {
      const { data: hrCase, error } = await supabase
        .from('hr_cases')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return hrCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-cases'] });
      toast({
        title: 'HR Fall aktualisiert',
        description: 'Der HR Fall wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der HR Fall konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      console.error('Update HR case error:', error);
    },
  });
};

export const useCloseHrCase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => {
      const { data: hrCase, error } = await supabase
        .from('hr_cases')
        .update({
          status: 'closed',
          resolution,
          closed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return hrCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-cases'] });
      toast({
        title: 'HR Fall geschlossen',
        description: 'Der HR Fall wurde erfolgreich geschlossen.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der HR Fall konnte nicht geschlossen werden.',
        variant: 'destructive',
      });
      console.error('Close HR case error:', error);
    },
  });
};

export const useAddTimelineEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      caseId, 
      entry 
    }: { 
      caseId: string; 
      entry: {
        action: string;
        description: string;
        user_id?: string;
      }
    }) => {
      // Get current case
      const { data: currentCase, error: fetchError } = await supabase
        .from('hr_cases')
        .select('timeline')
        .eq('id', caseId)
        .single();
      
      if (fetchError) throw fetchError;

      const newEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        user_id: entry.user_id || (await supabase.auth.getUser()).data.user?.id,
      };

      const updatedTimeline = [...(currentCase.timeline || []), newEntry];

      const { data: hrCase, error } = await supabase
        .from('hr_cases')
        .update({ timeline: updatedTimeline })
        .eq('id', caseId)
        .select()
        .single();
      
      if (error) throw error;
      return hrCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-cases'] });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Der Timeline-Eintrag konnte nicht hinzugefügt werden.',
        variant: 'destructive',
      });
      console.error('Add timeline entry error:', error);
    },
  });
};