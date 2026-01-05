
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { toast } from 'sonner';

export const useFetchEvents = () => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data: dbEvents, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Fehler beim Laden der Termine aus der Datenbank:', error);
          return;
        }
        
        if (dbEvents && dbEvents.length > 0) {
          const formattedEvents: CalendarEvent[] = dbEvents.map(event => {
            let start: Date;
            let end: Date;
            
            try {
              start = new Date(event.start_time);
              end = new Date(event.end_time);
            } catch (e) {
              console.error('Error parsing date:', e);
              start = new Date();
              end = new Date(start.getTime() + 60 * 60 * 1000);
            }
            
            return {
              id: event.id,
              title: event.title,
              start,
              end,
              category: event.type || 'meeting', 
              type: event.type || 'meeting',
              color: event.color || 'blue',
              project: '',
              location: event.location || '',
              description: event.description || '',
              address: event.location || '',
              participants: event.attendees || []
            };
          });
          
          setLocalEvents(formattedEvents);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Termine:', err);
        toast.error("Termine konnten nicht geladen werden");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Load events from localStorage
  useEffect(() => {
    try {
      const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
      if (savedEvents.length > 0) {
        const parsedEvents = savedEvents.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        
        setLocalEvents(prevEvents => [...prevEvents, ...parsedEvents]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Termine:', error);
      toast.error("Termine konnten nicht geladen werden");
    }
  }, []);

  return {
    localEvents,
    setLocalEvents,
    isLoading
  };
};
