import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePulseSurveys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: surveys, isLoading } = useQuery({
    queryKey: ['pulse-surveys'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole) throw new Error('No tenant found');

      const { data, error } = await supabase
        .from('pulse_surveys')
        .select('*')
        .eq('tenant_id', userRole.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createSurvey = useMutation({
    mutationFn: async (surveyData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole) throw new Error('No tenant found');

      const { data, error } = await supabase
        .from('pulse_surveys')
        .insert({
          ...surveyData,
          tenant_id: userRole.tenant_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys'] });
      toast({
        title: 'Umfrage erstellt',
        description: 'Die Umfrage wurde erfolgreich erstellt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: 'Die Umfrage konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    },
  });

  return {
    surveys: surveys || [],
    isLoading,
    createSurvey: createSurvey.mutate,
    isCreating: createSurvey.isPending,
  };
};
