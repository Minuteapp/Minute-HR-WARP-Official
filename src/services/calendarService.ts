import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';

export type CalendarHoliday = {
  id: string;
  name: string;
  date: string;
  country_code: string;
  region_code?: string;
  is_public_holiday: boolean;
  description?: string;
};

export type CalendarResource = {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'vehicle' | 'other';
  description?: string;
  capacity?: number;
  location?: string;
  features?: any;
  booking_rules?: any;
  is_active: boolean;
};

export type EventAttendee = {
  id: string;
  event_id: string;
  user_id?: string;
  email: string;
  name?: string;
  response_status: 'pending' | 'accepted' | 'declined' | 'tentative';
  is_organizer: boolean;
  is_optional: boolean;
  responded_at?: string;
};

export type CalendarConflict = {
  id: string;
  event_id: string;
  conflicting_event_id: string;
  conflict_type: 'time_overlap' | 'resource_conflict' | 'attendee_conflict';
  severity: 'low' | 'medium' | 'high';
  auto_resolved: boolean;
  resolution_note?: string;
  detected_at: string;
  resolved_at?: string;
};

export type CalendarAIInsight = {
  id: string;
  user_id: string;
  insight_type: 'meeting_optimization' | 'time_block_suggestion' | 'conflict_prevention' | 'focus_time';
  title: string;
  description: string;
  recommended_action?: any;
  confidence_score: number;
  status: 'new' | 'acknowledged' | 'applied' | 'dismissed';
  metadata?: any;
  created_at: string;
  acknowledged_at?: string;
};

class CalendarService {
  // Events
  async getEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: {
          from: startDate,
          to: endDate,
          eventType: []
        }
      });
      if (error) {
        console.error('Error fetching calendar events via Edge Function:', error);
        return [];
      }
      const events = (data?.events || data || []) as CalendarEvent[];
      return events;
    } catch (e) {
      console.error('Calendar events fetch failed:', e);
      return [];
    }
  }

  async createEvent(eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    // Map interface properties to database columns
    const { start, end, isAllDay, participants, ...otherData } = eventData;
    
    // Hole die company_id des aktuellen Users
    const { data: { user } } = await supabase.auth.getUser();
    let userCompanyId = null;
    
    if (user) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      userCompanyId = userRole?.company_id;
    }
    
    const dbData = {
      ...otherData,
      start_time: start,
      end_time: end,
      is_all_day: isAllDay,
      attendees: participants || [],
      created_by: user?.id,
      company_id: userCompanyId
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }

    // Map database columns back to interface
    return {
      ...data,
      start: data.start_time,
      end: data.end_time,
      isAllDay: data.is_all_day,
      participants: data.attendees || []
    };
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    // Map interface properties to database columns
    const { start, end, isAllDay, participants, ...otherUpdates } = updates;
    const dbUpdates = {
      ...otherUpdates,
      ...(start && { start_time: start }),
      ...(end && { end_time: end }),
      ...(isAllDay !== undefined && { is_all_day: isAllDay }),
      ...(participants !== undefined && { attendees: participants })
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }

    // Map database columns back to interface
    return {
      ...data,
      start: data.start_time,
      end: data.end_time,
      isAllDay: data.is_all_day,
      participants: data.attendees || []
    };
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Attendees
  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .order('is_organizer', { ascending: false });

    if (error) {
      console.error('Error fetching event attendees:', error);
      throw error;
    }

    return data || [];
  }

  async addAttendee(attendeeData: Partial<EventAttendee>): Promise<EventAttendee> {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert([attendeeData])
      .select()
      .single();

    if (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }

    return data;
  }

  async updateAttendeeResponse(attendeeId: string, responseStatus: string): Promise<EventAttendee> {
    const { data, error } = await supabase
      .from('event_attendees')
      .update({ 
        response_status: responseStatus,
        responded_at: new Date().toISOString()
      })
      .eq('id', attendeeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendee response:', error);
      throw error;
    }

    return data;
  }

  // Holidays
  async getHolidays(year?: number, countryCode = 'DE', regionCode?: string): Promise<CalendarHoliday[]> {
    let query = supabase
      .from('calendar_holidays')
      .select('*')
      .eq('country_code', countryCode)
      .order('date', { ascending: true });

    if (regionCode) {
      query = query.eq('region_code', regionCode);
    }

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
    
    return data || [];
  }

  // Resources
  async getResources(): Promise<CalendarResource[]> {
    const { data, error } = await supabase
      .from('calendar_resources')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching calendar resources:', error);
      throw error;
    }

    return data || [];
  }

  async bookResource(eventId: string, resourceId: string, setupNotes?: string): Promise<void> {
    const { error } = await supabase
      .from('event_resources')
      .insert([{
        event_id: eventId,
        resource_id: resourceId,
        setup_notes: setupNotes,
        booking_status: 'booked'
      }]);

    if (error) {
      console.error('Error booking resource:', error);
      throw error;
    }
  }

  // Conflicts
  async getConflicts(eventId?: string): Promise<CalendarConflict[]> {
    let query = supabase
      .from('calendar_conflicts')
      .select(`
        *,
        event:calendar_events!calendar_conflicts_event_id_fkey(title, start_time, end_time),
        conflicting_event:calendar_events!calendar_conflicts_conflicting_event_id_fkey(title, start_time, end_time)
      `)
      .order('detected_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching calendar conflicts:', error);
      throw error;
    }
    
    return data || [];
  }

  async detectConflicts(eventData: Partial<CalendarEvent>): Promise<CalendarConflict[]> {
    // Vereinfachte Konfliktprüfung - in der Realität würde hier komplexere Logik stehen
    const startStr = typeof eventData.start === 'string' ? eventData.start : eventData.start?.toISOString();
    const endStr = typeof eventData.end === 'string' ? eventData.end : eventData.end?.toISOString();
    const overlappingEvents = await this.getEvents(startStr, endStr);
    
    const conflicts: CalendarConflict[] = [];
    
    for (const event of overlappingEvents) {
      if (event.id !== eventData.id) {
        // Prüfe Zeitüberschneidung
        const startA = new Date(startStr!);
        const endA = new Date(endStr!);
        const startB = new Date(event.start);
        const endB = new Date(event.end);
        
        if (startA < endB && endA > startB) {
          conflicts.push({
            id: `conflict-${Date.now()}`,
            event_id: eventData.id!,
            conflicting_event_id: event.id,
            conflict_type: 'time_overlap',
            severity: 'medium',
            auto_resolved: false,
            detected_at: new Date().toISOString()
          });
        }
      }
    }
    
    return conflicts;
  }

  // AI Insights
  async getAIInsights(): Promise<CalendarAIInsight[]> {
    const { data, error } = await supabase
      .from('calendar_ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching AI insights:', error);
      throw error;
    }

    return data || [];
  }

  async acknowledgeInsight(insightId: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_ai_insights')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (error) {
      console.error('Error acknowledging insight:', error);
      throw error;
    }
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    
    // Heutige Events
    const todayEvents = await this.getEvents(
      new Date().toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    // Diese Woche Events
    const weekEvents = await this.getEvents(
      startOfWeek.toISOString(),
      endOfWeek.toISOString()
    );

    // Konflikte
    const conflicts = await this.getConflicts();
    const unresolvedConflicts = conflicts.filter(c => !c.auto_resolved && !c.resolved_at);

    // AI Insights
    const insights = await this.getAIInsights();
    const newInsights = insights.filter(i => i.status === 'new');

    return {
      todayEvents: todayEvents.length,
      weekEvents: weekEvents.length,
      unresolvedConflicts: unresolvedConflicts.length,
      newAIInsights: newInsights.length,
      upcomingEvents: weekEvents.slice(0, 5),
      recentInsights: insights.slice(0, 3)
    };
  }

  // Quick Actions
  async createQuickEvent(title: string, startTime: string, duration = 60): Promise<CalendarEvent> {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    return this.createEvent({
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      type: 'meeting',
      priority: 'medium',
      visibility: 'public',
      color: '#3B82F6'
    });
  }

  // Templates
  getEventTemplates() {
    return [
      {
        id: 'meeting',
        name: 'Meeting',
        icon: 'Users',
        duration: 60,
        type: 'meeting',
        color: '#3B82F6'
      },
      {
        id: 'sprint-review',
        name: 'Sprint Review',
        icon: 'BarChart3',
        duration: 90,
        type: 'review',
        color: '#10B981'
      },
      {
        id: 'retrospective',
        name: 'Retrospektive',
        icon: 'MessageSquare',
        duration: 60,
        type: 'retrospective',
        color: '#F59E0B'
      },
      {
        id: 'training',
        name: 'Schulung',
        icon: 'BookOpen',
        duration: 120,
        type: 'training',
        color: '#8B5CF6'
      },
      {
        id: 'presentation',
        name: 'Präsentation',
        icon: 'Presentation',
        duration: 30,
        type: 'presentation',
        color: '#EF4444'
      },
      {
        id: 'interview',
        name: 'Interview',
        icon: 'UserCheck',
        duration: 45,
        type: 'interview',
        color: '#06B6D4'
      }
    ];
  }

  // Additional methods
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getEvents(today, today);
  }

  async getCategories(): Promise<any[]> {
    const { data, error } = await supabase
      .from('calendar_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching calendar categories:', error);
      return [];
    }

    return data || [];
  }

  async createCategory(categoryData: any): Promise<any> {
    const { data, error } = await supabase
      .from('calendar_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  }

  async getUserSettings(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_calendar_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user settings:', error);
      throw error;
    }

    return data;
  }

  async updateUserSettings(userId: string, settings: any): Promise<void> {
    const { error } = await supabase
      .from('user_calendar_settings')
      .upsert({ user_id: userId, ...settings });

    if (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  async sendInvitation(eventId: string, email: string, name?: string): Promise<void> {
    const { error } = await supabase
      .from('event_invitations')
      .insert([{
        event_id: eventId,
        email,
        name,
        status: 'sent'
      }]);

    if (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  async createReminders(eventId: string, reminderTimes: string[]): Promise<void> {
    const reminders = reminderTimes.map(time => ({
      event_id: eventId,
      reminder_time: time
    }));

    const { error } = await supabase
      .from('event_reminders')
      .insert(reminders);

    if (error) {
      console.error('Error creating reminders:', error);
      throw error;
    }
  }

  async addComment(eventId: string, comment: string, isPrivate: boolean = false): Promise<void> {
    const { error } = await supabase
      .from('event_comments')
      .insert([{
        event_id: eventId,
        comment,
        is_private: isPrivate
      }]);

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();