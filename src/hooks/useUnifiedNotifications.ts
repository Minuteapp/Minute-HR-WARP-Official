import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UnifiedNotification {
  id: string;
  user_id: string;
  source_module: string;
  source_id: string;
  source_table: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  company_id?: string;
  created_at: string;
  read_at?: string;
}

export const useUnifiedNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Alle Benachrichtigungen abrufen
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['unified-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('unified_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
        return [];
      }

      return data as UnifiedNotification[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Alle 30 Sekunden aktualisieren
  });

  // Ungelesene Benachrichtigungen zählen
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Real-time Updates für neue Benachrichtigungen
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unified-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unified_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Neue Benachrichtigung erhalten:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'unified_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Benachrichtigung aktualisiert:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('unified_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (!error) {
        refetch();
      }
    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('unified_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (!error) {
        refetch();
      }
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('unified_notifications')
        .delete()
        .eq('id', notificationId);

      if (!error) {
        refetch();
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Benachrichtigung:', error);
    }
  };

  const getNotificationsByModule = (module: string) => {
    return notifications.filter(n => n.source_module === module);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  const getNotificationsByPriority = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    return notifications.filter(n => n.priority === priority);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByModule,
    getUnreadNotifications,
    getNotificationsByPriority,
    refetch
  };
};
