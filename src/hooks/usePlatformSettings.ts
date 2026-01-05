import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description: string | null;
  updated_at: string;
}

export const usePlatformSettings = (category?: string) => {
  return useQuery({
    queryKey: ['platform-settings', category],
    queryFn: async () => {
      let query = supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Konvertiere zu einem Objekt für einfacheren Zugriff
      const settings: Record<string, any> = {};
      (data || []).forEach(s => {
        settings[s.setting_key] = s.setting_value;
      });

      return { settings, raw: data as PlatformSetting[] };
    }
  });
};

export const useUpdatePlatformSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: value,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: 'Gespeichert',
        description: 'Die Einstellung wurde erfolgreich aktualisiert.'
      });
    },
    onError: () => {
      toast({
        title: 'Fehler',
        description: 'Die Einstellung konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  });
};

export const useSaveAllSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .update({
            setting_value: update.setting_value,
            updated_by: update.updated_by,
            updated_at: update.updated_at
          })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: 'Gespeichert',
        description: 'Alle Einstellungen wurden erfolgreich gespeichert.'
      });
    },
    onError: () => {
      toast({
        title: 'Fehler',
        description: 'Die Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  });
};
