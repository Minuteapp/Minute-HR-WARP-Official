import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PayType {
  id: string;
  component_type: 'base' | 'bonus' | 'overtime' | 'deduction' | 'benefit';
  name: string;
  amount: number;
  currency: string;
  description?: string;
  is_taxable?: boolean;
  is_social_security?: boolean;
  datev_account?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const usePayTypes = () => {
  const { data: payTypes, isLoading } = useQuery({
    queryKey: ['pay-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_components')
        .select('*')
        .order('component_type')
        .order('name');
      
      if (error) throw error;
      return data as PayType[];
    },
  });

  return {
    payTypes: payTypes || [],
    isLoading,
  };
};

export const useCreatePayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payType: Partial<PayType>) => {
      const { data, error } = await supabase
        .from('salary_components')
        .insert(payType)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-types'] });
      toast({
        title: "Erfolg",
        description: "Lohnart wurde erstellt.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: `Fehler beim Erstellen der Lohnart: ${error.message}`,
      });
    },
  });
};

export const useUpdatePayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PayType> }) => {
      const { data, error } = await supabase
        .from('salary_components')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-types'] });
      toast({
        title: "Erfolg",
        description: "Lohnart wurde aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: `Fehler beim Aktualisieren der Lohnart: ${error.message}`,
      });
    },
  });
};

export const useDeletePayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salary_components')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-types'] });
      toast({
        title: "Erfolg",
        description: "Lohnart wurde gelöscht.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: `Fehler beim Löschen der Lohnart: ${error.message}`,
      });
    },
  });
};
