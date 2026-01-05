import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageAttachment } from '@/types/chat';
import { toast } from 'sonner';

export const useChannelFiles = (channelId: string) => {
  const [files, setFiles] = useState<MessageAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('message_attachments')
          .select(`
            *,
            messages!inner (
              channel_id
            )
          `)
          .eq('messages.channel_id', channelId)
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Error loading files:', error);
          return;
        }

        setFiles(data || []);
      } catch (error) {
        console.error('Error in loadFiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();

    // Realtime subscription
    const subscription = supabase
      .channel(`channel-files-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_attachments',
        },
        () => {
          loadFiles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId]);

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .download(filePath);

      if (error || !data) {
        toast.error('Datei konnte nicht geladen werden');
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Datei wird heruntergeladen');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Fehler beim Herunterladen');
    }
  };

  return { files, loading, downloadFile };
};
