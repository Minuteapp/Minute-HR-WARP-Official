import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAI = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: aiModels = [], isLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: aiUsage = [], isLoading: usageLoading } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  const createAIModel = useMutation({
    mutationFn: async (modelData: any) => {
      const { data, error } = await supabase
        .from('ai_models')
        .insert([modelData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast({
        title: "KI-Modell erstellt",
        description: "Das KI-Modell wurde erfolgreich erstellt.",
      });
    },
  });

  return {
    aiModels,
    aiUsage,
    isLoading: isLoading || usageLoading,
    createAIModel: createAIModel.mutateAsync,
    isCreating: createAIModel.isPending,
  };
};