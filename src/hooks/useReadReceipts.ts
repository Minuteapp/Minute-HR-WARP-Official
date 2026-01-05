import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useReadReceipts = (channelId?: string) => {
  const [receipts, setReceipts] = useState<Record<string, ReadReceipt[]>>({});

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already marked as read - use maybeSingle() to avoid error when not found
      const { data: existing } = await supabase
        .from('message_read_receipts')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) return;

      const { error } = await supabase
        .from('message_read_receipts')
        .insert({
          message_id: messageId,
          user_id: user.id,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getReadReceipts = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_read_receipts')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('message_id', messageId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting read receipts:', error);
      return [];
    }
  };

  const loadReceiptsForMessages = async (messageIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('message_read_receipts')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .in('message_id', messageIds);

      if (error) throw error;

      const grouped = (data || []).reduce((acc, receipt) => {
        if (!acc[receipt.message_id]) {
          acc[receipt.message_id] = [];
        }
        acc[receipt.message_id].push(receipt);
        return acc;
      }, {} as Record<string, ReadReceipt[]>);

      setReceipts(grouped);
    } catch (error) {
      console.error('Error loading read receipts:', error);
    }
  };

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`read_receipts_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_read_receipts',
        },
        () => {
          // Reload receipts when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return {
    receipts,
    markMessageAsRead,
    getReadReceipts,
    loadReceiptsForMessages,
  };
};
