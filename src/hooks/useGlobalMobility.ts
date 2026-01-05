
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GlobalMobilityRequest } from '@/types/global-mobility';

export const useGlobalMobilityRequests = () => {
  return useQuery({
    queryKey: ['global-mobility-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_mobility_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GlobalMobilityRequest[];
    },
  });
};

export const useGlobalMobilityRequest = (id: string) => {
  return useQuery({
    queryKey: ['global-mobility-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_mobility_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as GlobalMobilityRequest;
    },
    enabled: !!id,
  });
};

export const useCreateGlobalMobilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: Omit<GlobalMobilityRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('global_mobility_requests')
        .insert({
          ...request,
          employee_id: user?.user?.id || request.employee_id
        })
        .select()
        .single();

      if (error) throw error;
      return data as GlobalMobilityRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-mobility-requests'] });
      toast({
        title: "Antrag erstellt",
        description: "Der Global Mobility Antrag wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Antrag konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateGlobalMobilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...request }: Partial<GlobalMobilityRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('global_mobility_requests')
        .update(request)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as GlobalMobilityRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-mobility-requests'] });
      toast({
        title: "Antrag aktualisiert",
        description: "Der Global Mobility Antrag wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Antrag konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};
