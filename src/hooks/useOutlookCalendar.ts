import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { 
  initializeOutlookClient, 
  fetchOutlookEvents, 
  createOutlookEvent,
  updateOutlookEvent,
  deleteOutlookEvent
} from '@/services/outlookCalendar';
import { useToast } from "@/hooks/use-toast";

export const useOutlookCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const clientId = localStorage.getItem('OUTLOOK_CLIENT_ID');
        const clientSecret = localStorage.getItem('OUTLOOK_CLIENT_SECRET');
        const tenantId = localStorage.getItem('OUTLOOK_TENANT_ID');

        if (!clientId || !clientSecret || !tenantId) {
          console.log('Missing Outlook credentials');
          setIsLoading(false);
          return;
        }

        const outlookClient = await initializeOutlookClient({
          clientId,
          clientSecret,
          tenantId
        });

        setClient(outlookClient);
        const fetchedEvents = await fetchOutlookEvents(outlookClient);
        setEvents(fetchedEvents);
        setIsLoading(false);

        toast({
          title: "Kalender aktualisiert",
          description: `${fetchedEvents.length} Ereignisse aus Outlook geladen`,
        });
      } catch (err) {
        console.error('Error initializing Outlook client:', err);
        const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Outlook-Ereignisse';
        setError(errorMessage);
        setIsLoading(false);
        
        toast({
          title: "Fehler",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    initializeClient();
  }, [toast]);

  const createEvent = async (event: CalendarEvent) => {
    if (!client) return;
    
    try {
      const createdEvent = await createOutlookEvent(client, event);
      const updatedEvents = await fetchOutlookEvents(client);
      setEvents(updatedEvents);
      
      toast({
        title: "Termin erstellt",
        description: "Der Termin wurde erfolgreich in Outlook erstellt",
      });
      
      return createdEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Erstellen des Termins';
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateEvent = async (event: CalendarEvent) => {
    if (!client) return;
    
    try {
      const updatedEvent = await updateOutlookEvent(client, event);
      const updatedEvents = await fetchOutlookEvents(client);
      setEvents(updatedEvents);
      
      toast({
        title: "Termin aktualisiert",
        description: "Der Termin wurde erfolgreich in Outlook aktualisiert",
      });
      
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Termins';
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!client) return;
    
    try {
      await deleteOutlookEvent(client, eventId);
      const updatedEvents = await fetchOutlookEvents(client);
      setEvents(updatedEvents);
      
      toast({
        title: "Termin gelöscht",
        description: "Der Termin wurde erfolgreich aus Outlook gelöscht",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen des Termins';
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { 
    events, 
    isLoading, 
    error,
    createEvent,
    updateEvent,
    deleteEvent
  };
};