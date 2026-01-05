import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWorkflows = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .order('workflow_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflowData: any) => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .insert([workflowData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({
        title: "Workflow erstellt",
        description: "Der Workflow wurde erfolgreich erstellt.",
      });
    },
  });

  return {
    workflows,
    isLoading,
    createWorkflow: createWorkflow.mutateAsync,
    isCreating: createWorkflow.isPending,
  };
};