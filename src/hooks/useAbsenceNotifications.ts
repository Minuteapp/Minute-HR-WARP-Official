
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AbsenceNotification {
  id: string;
  absence_request_id: string;
  notification_type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useAbsenceNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['absence-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('absence_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
        return [];
      }

      return data as AbsenceNotification[];
    },
    enabled: !!user?.id
  });

  // Ungelesene Benachrichtigungen zählen
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Realtime-Updates für Benachrichtigungen
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('absence-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'absence_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'absence_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('absence_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      refetch();
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('absence_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      refetch();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  };
};
