
import { supabase } from '@/integrations/supabase/client';

export interface TaskNotification {
  id: string;
  task_id: string;
  user_id: string;
  notification_type: 'task_completed' | 'task_assigned' | 'task_status_changed';
  message: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EmployeeTaskActivity {
  id: string;
  employee_id: string;
  task_id: string;
  activity_type: 'completed' | 'assigned' | 'unassigned' | 'status_changed';
  previous_status?: string;
  new_status?: string;
  completion_date?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const taskNotificationService = {
  // Alle Benachrichtigungen für einen Benutzer abrufen
  getUserNotifications: async (userId: string): Promise<TaskNotification[]> => {
    const { data, error } = await supabase
      .from('task_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Task-Benachrichtigungen:', error);
      throw error;
    }

    return data || [];
  },

  // Ungelesene Benachrichtigungen abrufen
  getUnreadNotifications: async (userId: string): Promise<TaskNotification[]> => {
    const { data, error } = await supabase
      .from('task_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der ungelesenen Benachrichtigungen:', error);
      throw error;
    }

    return data || [];
  },

  // Benachrichtigung als gelesen markieren
  markAsRead: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from('task_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Fehler beim Markieren der Benachrichtigung als gelesen:', error);
      throw error;
    }
  },

  // Alle Benachrichtigungen als gelesen markieren
  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('task_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Fehler beim Markieren aller Benachrichtigungen als gelesen:', error);
      throw error;
    }
  },

  // Task-Aktivitäten für einen Mitarbeiter abrufen
  getEmployeeTaskActivities: async (employeeId: string): Promise<EmployeeTaskActivity[]> => {
    const { data, error } = await supabase
      .from('employee_task_activities')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Mitarbeiter-Task-Aktivitäten:', error);
      throw error;
    }

    return data || [];
  },

  // Anzahl ungelesener Benachrichtigungen abrufen
  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('task_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Fehler beim Zählen der ungelesenen Benachrichtigungen:', error);
      return 0;
    }

    return count || 0;
  }
};
