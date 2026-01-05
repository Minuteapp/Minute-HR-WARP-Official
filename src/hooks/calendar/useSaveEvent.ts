
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, NewEvent } from '@/types/calendar';
import { sendInvitationEmails } from '@/utils/calendar/sendInvitation';
import { useToast } from '@/hooks/use-toast';
import { useCalendarDocuments } from './useCalendarDocuments';
import { v4 as uuidv4 } from 'uuid';

export const useSaveEvent = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { uploadDocument } = useCalendarDocuments();

  const saveNewEvent = async (
    newEvent: NewEvent, 
    onSuccess: (event: CalendarEvent) => void
  ) => {
    setIsSaving(true);

    try {
      // Generiere UUID für das Event
      const eventId = uuidv4();
      
      // Erstelle ein Supabase-Event-Objekt
      const supabaseEvent = {
        id: eventId,
        title: newEvent.title,
        start_time: newEvent.start,
        end_time: newEvent.end,
        type: newEvent.type,
        color: newEvent.color || 'blue',
        location: newEvent.location || '',
        description: newEvent.description || '',
        is_all_day: newEvent.isAllDay || false,
        attendees: JSON.stringify(newEvent.participants || []),
      };
      
      // Speichere das Event in der Datenbank
      const { error } = await supabase
        .from('calendar_events')
        .insert([supabaseEvent]);
      
      if (error) {
        console.error('Fehler beim Speichern des Termins:', error);
        toast({
          title: "Fehler beim Speichern",
          description: "Der Termin konnte nicht gespeichert werden.",
          variant: "destructive"
        });
        return false;
      }
      
      // Für lokale Speicherung Format anpassen
      let newCalendarEvent: CalendarEvent = {
        id: eventId,
        title: newEvent.title,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
        type: newEvent.type,
        color: newEvent.color || 'blue',
        location: newEvent.location || '',
        description: newEvent.description || '',
        participants: newEvent.participants || [],
        isAllDay: newEvent.isAllDay || false,
        documents: []
      };
      
      // Dokumente hochladen, wenn vorhanden
      if (newEvent.documents && newEvent.documents.length > 0 && newEvent.documentTypes) {
        const uploadPromises = newEvent.documents.map(async (file, index) => {
          const documentType = newEvent.documentTypes?.[index] || 'other';
          return await uploadDocument(file, eventId, documentType);
        });
        
        // Warte auf alle Uploads
        const uploadedDocuments = await Promise.all(uploadPromises);
        
        // Filtere null-Werte (fehlgeschlagene Uploads)
        newCalendarEvent.documents = uploadedDocuments.filter(doc => doc !== null) as any;
      }
      
      // Sende Einladungen, wenn Teilnehmer vorhanden sind
      if (newEvent.participants && newEvent.participants.length > 0) {
        await sendInvitationEmails(newEvent.participants, newCalendarEvent.id);
      }
      
      // Speichere auch lokal für Offline-Zugriff
      try {
        const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        savedEvents.push({
          ...newCalendarEvent,
          start: new Date(newEvent.start).toISOString(),
          end: new Date(newEvent.end).toISOString()
        });
        localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
      } catch (error) {
        console.error('Fehler beim lokalen Speichern:', error);
      }
      
      toast({
        title: "Termin gespeichert",
        description: "Der Termin wurde erfolgreich gespeichert.",
      });
      
      onSuccess(newCalendarEvent);
      return true;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Speichern:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveNewEvent,
    isSaving
  };
};
