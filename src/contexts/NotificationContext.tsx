
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'info' | 'warning' | 'success' | 'error';
export type NotificationCategory = 
  | 'system' 
  | 'chat' 
  | 'task' 
  | 'project' 
  | 'approval' 
  | 'calendar' 
  | 'document' 
  | 'update'
  | 'hr'
  | 'feedback'
  | 'security'
  | 'recruiting'
  | 'onboarding';

export type NotificationChannel = 
  | 'in-app'
  | 'email'
  | 'push'
  | 'sms'
  | 'slack';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  type?: string;
  link?: string;
  actionRequired?: boolean;
  favorite?: boolean;
  archived?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface NotificationPreference {
  category: NotificationCategory;
  enabled: boolean;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationPreferences {
  channels: {
    [key in NotificationChannel]: boolean;
  };
  categories: {
    [key in NotificationCategory]: boolean;
  };
  mutedCategories: MuteSettings[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  priorityOnly: boolean;
  dailyDigest: boolean;
}

export type MuteSettings = {
  type: NotificationCategory;
  duration: 'temporary' | 'permanent';
  expiresAt?: Date;
  createdAt: Date;
};

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  isCategoryMuted: (category: NotificationCategory) => boolean;
  muteCategory: (category: NotificationCategory, duration?: number) => void;
  unmuteCategory: (category: NotificationCategory) => void;
  getMuteDuration: (category: NotificationCategory) => number | null;
  archiveNotification: (id: string) => void;
  restoreNotification: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getUnreadCount: () => number;
  setReminder: (id: string, duration: number) => void;
  activeNotifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Record<string, number>>({});
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: {
      'in-app': true,
      'email': true,
      'push': true,
      'sms': false,
      'slack': false
    },
    categories: {
      'system': true,
      'chat': true,
      'task': true,
      'project': true,
      'approval': true,
      'calendar': true,
      'document': true,
      'update': true,
      'hr': true,
      'feedback': true,
      'security': true,
      'recruiting': true,
      'onboarding': true
    },
    mutedCategories: [],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    priorityOnly: false,
    dailyDigest: true
  });
  const [mutedCategories, setMutedCategories] = useState<Record<string, number>>({});

  useEffect(() => {
    // Keine Mock-Benachrichtigungen - werden aus der Datenbank geladen
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
    // Hier könnte man die Änderungen auch persistent speichern
  };

  const isCategoryMuted = (category: NotificationCategory) => {
    if (!mutedCategories[category]) return false;
    
    // Wenn abgelaufen, dann automatisch entmuten
    if (mutedCategories[category] < Date.now()) {
      const updatedMutedCategories = { ...mutedCategories };
      delete updatedMutedCategories[category];
      setMutedCategories(updatedMutedCategories);
      return false;
    }
    
    return true;
  };

  const muteCategory = (category: NotificationCategory, duration = 3600000) => { // 1h default
    setMutedCategories(prev => ({
      ...prev,
      [category]: Date.now() + duration
    }));
  };

  const unmuteCategory = (category: NotificationCategory) => {
    setMutedCategories(prev => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const getMuteDuration = (category: NotificationCategory) => {
    if (!mutedCategories[category]) return null;
    const remainingTime = mutedCategories[category] - Date.now();
    return remainingTime > 0 ? remainingTime : null;
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, archived: true } : notification
      )
    );
  };

  const restoreNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, archived: false } : notification
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, favorite: !notification.favorite } : notification
      )
    );
  };

  const setReminder = (id: string, duration: number) => {
    const reminderTime = Date.now() + duration;
    setReminders(prev => ({ ...prev, [id]: reminderTime }));
    
    // Benachrichtigung temporär archivieren
    archiveNotification(id);
    
    // Nach Ablauf wieder anzeigen
    setTimeout(() => {
      restoreNotification(id);
      setReminders(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }, duration);
  };

  // Aktive Benachrichtigungen (ohne archivierte, es sei denn sie haben eine Erinnerung)
  const activeNotifications = notifications.filter(n => {
    return !n.archived || (reminders[n.id] && reminders[n.id] > Date.now());
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
        updatePreferences,
        isCategoryMuted,
        muteCategory,
        unmuteCategory,
        getMuteDuration,
        archiveNotification,
        restoreNotification,
        toggleFavorite,
        getUnreadCount,
        setReminder,
        activeNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
