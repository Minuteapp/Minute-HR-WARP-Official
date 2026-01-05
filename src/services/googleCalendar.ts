import { CalendarEvent } from '@/types/calendar';

export const fetchGoogleCalendarEvents = async (apiKey: string, calendarId: string): Promise<CalendarEvent[]> => {
  if (!apiKey || !calendarId) {
    console.error('Missing Google Calendar credentials');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google Calendar events');
    }

    const data = await response.json();
    
    return data.items.map((event: any) => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      location: event.location,
      category: 'meeting',
      type: 'meeting',
      source: 'google',
      project: '',
      color: 'blue',
      participants: event.attendees?.map((attendee: any) => attendee.email) || []
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};