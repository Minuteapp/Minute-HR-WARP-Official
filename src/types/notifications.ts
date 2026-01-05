
export type NotificationPriority = 'low' | 'medium' | 'high' | 'info' | 'warning' | 'success' | 'error';

export type NotificationCategory = 
  | 'system'
  | 'hr'
  | 'task'
  | 'approval'
  | 'feedback'
  | 'calendar'
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
  timestamp: Date;
  read: boolean;
  
  // Zusätzliche Eigenschaften
  category: NotificationCategory;
  priority: NotificationPriority;
  type?: string; // Für die Kompatibilität mit vorhandenen Benachrichtigungen
  link?: string;
  actionRequired?: boolean;
  status?: 'approved' | 'rejected';
  favorite?: boolean;
  archived?: boolean;
  channel?: NotificationChannel;
}

export type MuteSettings = {
  type: NotificationCategory;
  duration: 'temporary' | 'permanent';
  expiresAt?: Date;
  createdAt: Date;
};

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
