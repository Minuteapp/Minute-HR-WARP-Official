import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goalData: any) => {
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId, error: rpcError } = await supabase.rpc('get_effective_company_id');
      
      console.log('createGoal - companyId:', companyId, 'rpcError:', rpcError);
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goalData, company_id: companyId }])
        .select()
        .single();
      
      if (error) {
        console.error('createGoal - DB Error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Ziel erstellt",
        description: "Das Ziel wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      console.error('createGoal - Mutation Error:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Das Ziel konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createGoal.mutateAsync,
    isCreating: createGoal.isPending,
  };
};