export type CalendarViewType = 'day' | 'week' | 'month' | 'year' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  category?: string;
  type: string;
  color?: string;
  project?: string;
  location?: string;
  description?: string;
  address?: string;
  participants?: string[];
  allDay?: boolean;
  isAllDay?: boolean;
  documents?: EventDocument[];
  completed?: boolean;
  // Neue erweiterte Eigenschaften
  category_id?: string;
  series_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  visibility?: 'public' | 'private' | 'confidential';
  meeting_url?: string;
  meeting_password?: string;
  max_attendees?: number;
  booking_deadline?: string;
  approval_required?: boolean;
  approved_by?: string;
  approved_at?: string;
  reminders?: CalendarReminder[];
  invitations?: CalendarInvitation[];
  comments?: CalendarComment[];
}

export interface NewEvent {
  title: string;
  start: string;
  end: string;
  type: string;
  color?: string;
  project?: string;
  location?: string;
  description?: string;
  address?: string;
  participants?: string[];
  isAllDay?: boolean;
  documents?: File[];
  documentTypes?: EventDocumentType[];
  // Neue erweiterte Eigenschaften
  category_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  visibility?: 'public' | 'private' | 'confidential';
  meeting_url?: string;
  meeting_password?: string;
  max_attendees?: number;
  booking_deadline?: string;
  approval_required?: boolean;
  recurrence_rule?: string;
  reminder_times?: string[];
}

export type EventDocumentType = 'resume' | 'agenda' | 'contract' | 'presentation' | 'report' | 'form' | 'other';

export interface EventDocument {
  id: string;
  name: string;
  url: string;
  type: EventDocumentType;
  size: number;
  uploadedAt: Date;
  containsPersonalData: boolean;
}

// Neue Interfaces für erweiterte Features
export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  is_default: boolean;
  created_by?: string;
  created_at: string;
}

export interface CalendarInvitation {
  id: string;
  event_id: string;
  invitee_email: string;
  invitee_name?: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  rsvp_token?: string;
  invited_at: string;
  responded_at?: string;
  notes?: string;
}

export interface CalendarReminder {
  id: string;
  event_id: string;
  user_id: string;
  reminder_time: string; // Interval wie '15 minutes', '1 hour', '1 day'
  reminder_method: 'notification' | 'email' | 'sms';
  is_sent: boolean;
  created_at: string;
}

export interface CalendarComment {
  id: string;
  event_id: string;
  user_id: string;
  comment: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventSeries {
  id: string;
  title: string;
  recurrence_rule: string; // RRULE format
  start_date: string;
  end_date?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface UserCalendarSettings {
  id: string;
  user_id: string;
  default_view: CalendarViewType;
  start_hour: number;
  end_hour: number;
  time_format: '12h' | '24h';
  first_day_of_week: number;
  timezone: string;
  default_reminder_time: string;
  show_weekends: boolean;
  theme_color: string;
  notification_settings: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  integration_type: 'google' | 'outlook' | 'apple' | 'caldav';
  is_enabled: boolean;
  credentials?: Record<string, any>;
  sync_settings: Record<string, any>;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}
