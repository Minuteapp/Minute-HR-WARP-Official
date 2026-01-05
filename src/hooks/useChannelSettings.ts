import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChannelSettings {
  notify_all: boolean;
  notify_mentions: boolean;
  pinned: boolean;
  thread_notifications: boolean;
}

const defaultSettings: ChannelSettings = {
  notify_all: false,
  notify_mentions: true,
  pinned: false,
  thread_notifications: true,
};

export const useChannelSettings = (channelId: string) => {
  const [settings, setSettings] = useState<ChannelSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!channelId) return;
    loadSettings();
  }, [channelId]);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('channel_member_settings')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          notify_all: data.notify_all ?? false,
          notify_mentions: data.notify_mentions ?? true,
          pinned: data.pinned ?? false,
          thread_notifications: data.thread_notifications ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading channel settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof ChannelSettings, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { error } = await supabase
        .from('channel_member_settings')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          ...newSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,channel_id'
        });

      if (error) throw error;

      toast({
        title: 'Einstellung gespeichert',
        description: 'Die Kanal-Einstellung wurde aktualisiert.',
      });
    } catch (error) {
      console.error('Error updating channel setting:', error);
      toast({
        title: 'Fehler',
        description: 'Einstellung konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
      // Rollback
      setSettings(settings);
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    reload: loadSettings,
  };
};
