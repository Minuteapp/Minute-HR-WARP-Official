import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ArchivedChannel {
  id: string;
  channel_id: string;
  archived_by: string | null;
  archive_date: string;
  content: string;
  file_path: string | null;
  message_count: number | null;
  participants: any;
  project_id: string;
  created_at: string | null;
  channel?: {
    name: string;
    description: string;
  };
}

export const useChatArchive = () => {
  const [archivedChannels, setArchivedChannels] = useState<ArchivedChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArchivedChannels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_archives')
        .select(`
          *,
          channel:channels(name, description)
        `)
        .order('archive_date', { ascending: false });

      if (error) throw error;
      setArchivedChannels(data || []);
    } catch (error) {
      console.error('Error loading archived channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const archiveChannel = async (
    channelId: string,
    reason?: string,
    retentionDays: number = 365,
    legalHold: boolean = false
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call edge function to handle archiving
      const { data, error } = await supabase.functions.invoke('archive-channel', {
        body: {
          channelId,
          reason,
          retentionDays,
          legalHold,
        },
      });

      if (error) throw error;
      await loadArchivedChannels();
      return data;
    } catch (error) {
      console.error('Error archiving channel:', error);
      throw error;
    }
  };

  const restoreChannel = async (archiveId: string) => {
    try {
      const { error } = await supabase
        .from('chat_archives')
        .delete()
        .eq('id', archiveId);

      if (error) throw error;
      await loadArchivedChannels();
    } catch (error) {
      console.error('Error restoring channel:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadArchivedChannels();
  }, []);

  return {
    archivedChannels,
    loading,
    archiveChannel,
    restoreChannel,
    reload: loadArchivedChannels,
  };
};
