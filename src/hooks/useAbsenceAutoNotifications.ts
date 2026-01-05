
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AbsenceAutoNotification {
  id: string;
  absence_request_id: string;
  notification_type: string;
  recipient_user_id: string;
  recipient_email: string;
  subject: string;
  message: string;
  sent_at: string;
  status: string;
  metadata: any;
  created_at: string;
}

export const useAbsenceAutoNotifications = () => {
  const { user } = useAuth();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['absence-auto-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('absence_auto_notifications')
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der automatischen Benachrichtigungen:', error);
        return [];
      }

      return data as AbsenceAutoNotification[];
    },
    enabled: !!user?.id
  });

  // Realtime-Updates für neue automatische Benachrichtigungen
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('absence-auto-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'absence_auto_notifications',
          filter: `recipient_user_id=eq.${user.id}`
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

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.notification_type === type);
  };

  const getRecentNotifications = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return notifications.filter(n => 
      new Date(n.created_at) >= cutoffDate
    );
  };

  return {
    notifications,
    isLoading,
    refetch,
    getNotificationsByType,
    getRecentNotifications
  };
};
