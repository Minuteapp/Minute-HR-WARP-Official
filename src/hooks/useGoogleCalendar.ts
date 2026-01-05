
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { CalendarEvent } from '@/types/calendar';
import { fetchGoogleCalendarEvents } from '@/services/googleCalendar';

export const useGoogleCalendar = (apiKey?: string, calendarId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!apiKey || !calendarId) {
        console.log('Missing Google Calendar credentials');
        setIsLoading(false);
        return;
      }

      try {
        const fetchedEvents = await fetchGoogleCalendarEvents(apiKey, calendarId);
        setEvents(fetchedEvents);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Google Calendar events:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Google Calendar events';
        setError(errorMessage);
        setIsLoading(false);
        toast({
          description: "Kalenderereignisse konnten nicht geladen werden",
          variant: "destructive",
        });
      }
    };

    fetchEvents();
  }, [apiKey, calendarId]);

  return { events, isLoading, error };
};
