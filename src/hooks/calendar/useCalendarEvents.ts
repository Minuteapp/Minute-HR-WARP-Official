
import { useState, useEffect } from 'react';
import { CalendarEvent, NewEvent } from '@/types/calendar';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCalendarEvents = () => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    type: 'meeting',
    color: 'blue',
    participants: [],
    isAllDay: false,
  });

  // Daten aus Supabase und LocalStorage laden
  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        // Aus Supabase laden
        const { data: dbEvents, error } = await supabase
          .from('calendar_events')
          .select('*')
          .is('deleted_at', null)
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Fehler beim Laden der Termine:', error);
          toast.error("Termine konnten nicht geladen werden");
          return;
        }
        
        let formattedEvents: CalendarEvent[] = [];
        
        if (dbEvents && dbEvents.length > 0) {
          formattedEvents = dbEvents.map(event => {
            let start: Date;
            let end: Date;
            
            try {
              start = new Date(event.start_time);
              end = new Date(event.end_time || start);
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
              participants: event.attendees || [],
              isAllDay: event.is_all_day || false
            };
          });
        }

        // Aus localStorage laden (für Offline-Unterstützung)
        try {
          const savedEvents = localStorage.getItem('calendarEvents');
          if (savedEvents) {
            const parsedLocalEvents = JSON.parse(savedEvents).map((event: any) => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end)
            }));
            
            // Events zusammenführen und Duplikate vermeiden
            const existingIds = formattedEvents.map(e => e.id);
            const nonDuplicateLocalEvents = parsedLocalEvents.filter(
              (e: CalendarEvent) => !existingIds.includes(e.id)
            );
            
            formattedEvents = [...formattedEvents, ...nonDuplicateLocalEvents];
          }
        } catch (error) {
          console.error('Fehler beim Laden der gespeicherten Termine:', error);
        }
        
        setLocalEvents(formattedEvents);
      } catch (error) {
        console.error('Allgemeiner Fehler beim Laden der Termine:', error);
        toast.error("Termine konnten nicht geladen werden");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEvents();
  }, []);

  const handleSaveNewEvent = async (): Promise<boolean> => {
    try {
      const startDate = new Date(newEvent.start);
      const endDate = new Date(newEvent.end);
      
      // Überprüfen, ob Enddatum nach Startdatum liegt
      if (endDate <= startDate) {
        toast.error("Das Enddatum muss nach dem Startdatum liegen");
        return false;
      }
      
      // Event für die Datenbank vorbereiten
      const eventForDB = {
        id: uuidv4(),
        title: newEvent.title,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        type: newEvent.type,
        color: newEvent.color || 'blue',
        location: newEvent.location,
        description: newEvent.description,
        attendees: newEvent.participants || [],
        is_all_day: newEvent.isAllDay || false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };
      
      // In Supabase speichern
      const { error } = await supabase
        .from('calendar_events')
        .insert(eventForDB);
        
      if (error) {
        console.error('Fehler beim Speichern des Termins:', error);
        toast.error("Termin konnte nicht gespeichert werden");
        return false;
      }
      
      // Event für UI vorbereiten
      const newCalendarEvent: CalendarEvent = {
        id: eventForDB.id,
        title: eventForDB.title,
        start: startDate,
        end: endDate,
        type: eventForDB.type,
        category: eventForDB.type,
        color: eventForDB.color,
        location: eventForDB.location,
        description: eventForDB.description,
        participants: eventForDB.attendees,
        project: '',
        address: eventForDB.location || '',
        isAllDay: newEvent.isAllDay
      };
      
      // In lokalen State einfügen
      setLocalEvents(prevEvents => [...prevEvents, newCalendarEvent]);
      
      // Event zurücksetzen
      setNewEvent({
        title: '',
        start: new Date().toISOString(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        type: 'meeting',
        color: 'blue',
        participants: [],
        isAllDay: false,
      });
      
      return true;
    } catch (error) {
      console.error('Fehler beim Erstellen des Termins:', error);
      toast.error("Termin konnte nicht erstellt werden");
      return false;
    }
  };

  return {
    localEvents,
    setLocalEvents,
    newEvent,
    setNewEvent,
    handleSaveNewEvent,
    isLoading
  };
};
