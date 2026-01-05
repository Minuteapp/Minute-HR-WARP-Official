import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  RewardCatalogItem, 
  CreateRewardCatalogRequest, 
  UpdateRewardCatalogRequest 
} from '@/types/reward-catalog';
import { toast } from 'sonner';

export const useRewardCatalog = () => {
  return useQuery({
    queryKey: ['reward-catalog'],
    queryFn: async (): Promise<RewardCatalogItem[]> => {
      const { data, error } = await supabase
        .from('reward_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RewardCatalogItem[];
    },
  });
};

export const useActiveRewardCatalog = () => {
  return useQuery({
    queryKey: ['reward-catalog', 'active'],
    queryFn: async (): Promise<RewardCatalogItem[]> => {
      const { data, error } = await supabase
        .from('reward_catalog')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as RewardCatalogItem[];
    },
  });
};

export const useCreateRewardCatalogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRewardCatalogRequest): Promise<RewardCatalogItem> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('reward_catalog')
        .insert({
          ...request,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RewardCatalogItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      toast.success('Belohnung erfolgreich erstellt');
    },
    onError: (error) => {
      console.error('Error creating reward:', error);
      toast.error('Fehler beim Erstellen der Belohnung');
    },
  });
};

export const useUpdateRewardCatalogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateRewardCatalogRequest): Promise<RewardCatalogItem> => {
      const { id, ...updates } = request;
      
      const { data, error } = await supabase
        .from('reward_catalog')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RewardCatalogItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      toast.success('Belohnung erfolgreich aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating reward:', error);
      toast.error('Fehler beim Aktualisieren der Belohnung');
    },
  });
};

export const useDeleteRewardCatalogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('reward_catalog')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      toast.success('Belohnung erfolgreich gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting reward:', error);
      toast.error('Fehler beim Löschen der Belohnung');
    },
  });
};
