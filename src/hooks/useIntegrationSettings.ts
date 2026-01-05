import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationSettings {
  id?: string;
  integration_type: string;
  provider?: string;
  settings: Record<string, any>;
  is_active: boolean;
}

export const useIntegrationSettings = (integrationType: string) => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [integrationType]);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', integrationType)
        .maybeSingle();

      if (error) {
        console.error('Error loading integration settings:', error);
        toast({
          description: "Fehler beim Laden der Einstellungen",
          variant: "destructive",
        });
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Omit<IntegrationSettings, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          description: "Sie müssen angemeldet sein",
          variant: "destructive",
        });
        return false;
      }

      const settingsData = {
        user_id: user.id,
        ...newSettings,
      };

      let result;
      if (settings?.id) {
        // Update existing settings
        result = await supabase
          .from('integration_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('integration_settings')
          .insert(settingsData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving integration settings:', result.error);
        toast({
          description: "Fehler beim Speichern der Einstellungen",
          variant: "destructive",
        });
        return false;
      }

      setSettings(result.data);
      toast({
        description: "Einstellungen erfolgreich gespeichert",
      });
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        description: "Fehler beim Speichern der Einstellungen",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSettings = async () => {
    if (!settings?.id) return false;

    try {
      const { error } = await supabase
        .from('integration_settings')
        .delete()
        .eq('id', settings.id);

      if (error) {
        console.error('Error deleting integration settings:', error);
        toast({
          description: "Fehler beim Löschen der Einstellungen",
          variant: "destructive",
        });
        return false;
      }

      setSettings(null);
      toast({
        description: "Einstellungen erfolgreich gelöscht",
      });
      return true;
    } catch (error) {
      console.error('Error deleting settings:', error);
      return false;
    }
  };

  return {
    settings,
    isLoading,
    saveSettings,
    deleteSettings,
    reload: loadSettings,
  };
};