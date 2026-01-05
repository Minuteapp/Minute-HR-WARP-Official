
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskNotificationService, TaskNotification } from '@/services/taskNotificationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTaskNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Alle Benachrichtigungen abrufen
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['taskNotifications', user?.id],
    queryFn: () => user?.id ? taskNotificationService.getUserNotifications(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 30000, // Alle 30 Sekunden aktualisieren
  });

  // Ungelesene Benachrichtigungen zählen
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['unreadTaskNotifications', user?.id],
    queryFn: () => user?.id ? taskNotificationService.getUnreadNotifications(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setUnreadCount(unreadNotifications.length);
  }, [unreadNotifications]);

  // Real-time Updates für neue Benachrichtigungen
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('task-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Neue Task-Benachrichtigung erhalten:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'task_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Task-Benachrichtigung aktualisiert:', payload);
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
      await taskNotificationService.markAsRead(notificationId);
      refetch();
    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await taskNotificationService.markAllAsRead(user.id);
      refetch();
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
    }
  };

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  };
};
