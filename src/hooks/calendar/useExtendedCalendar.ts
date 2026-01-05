
import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarCategory, UserCalendarSettings } from '@/types/calendar';
import { calendarService } from '@/services/calendarService';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useExtendedCalendar = () => {
  const [categories, setCategories] = useState<CalendarCategory[]>([]);
  const [userSettings, setUserSettings] = useState<UserCalendarSettings | null>(null);
  const queryClient = useQueryClient();

  // Kategorien laden
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['calendar-categories'],
    queryFn: calendarService.getCategories,
    refetchInterval: 300000 // 5 Minuten
  });

  // Benutzereinstellungen laden
  const {
    data: settingsData,
    isLoading: settingsLoading
  } = useQuery({
    queryKey: ['user-calendar-settings'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;
      return calendarService.getUserSettings(user.data.user.id);
    },
    refetchInterval: 600000 // 10 Minuten
  });

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData as any[]);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (settingsData) {
      setUserSettings(settingsData);
    }
  }, [settingsData]);

  // Mutation für Kategorie erstellen
  const createCategoryMutation = useMutation({
    mutationFn: calendarService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-categories'] });
      toast.success('Kategorie wurde erfolgreich erstellt');
    },
    onError: (error) => {
      console.error('Fehler beim Erstellen der Kategorie:', error);
      toast.error('Kategorie konnte nicht erstellt werden');
    }
  });

  // Mutation für Benutzereinstellungen aktualisieren
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserCalendarSettings>) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Benutzer nicht authentifiziert');
      await calendarService.updateUserSettings(user.data.user.id, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-calendar-settings'] });
      toast.success('Einstellungen wurden gespeichert');
    },
    onError: (error) => {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      toast.error('Einstellungen konnten nicht gespeichert werden');
    }
  });

  // Funktion zum Senden von Einladungen
  const sendInvitation = async (eventId: string, email: string, name?: string) => {
    try {
      await calendarService.sendInvitation(eventId, email, name);
      toast.success(`Einladung wurde an ${email} gesendet`);
    } catch (error) {
      console.error('Fehler beim Senden der Einladung:', error);
      toast.error('Einladung konnte nicht gesendet werden');
    }
  };

  // Funktion zum Hinzufügen von Erinnerungen
  const addReminders = async (eventId: string, reminderTimes: string[]) => {
    try {
      await calendarService.createReminders(eventId, reminderTimes);
      toast.success('Erinnerungen wurden hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Erinnerungen:', error);
      toast.error('Erinnerungen konnten nicht hinzugefügt werden');
    }
  };

  // Funktion zum Hinzufügen von Kommentaren
  const addComment = async (eventId: string, comment: string, isPrivate: boolean = false) => {
    try {
      await calendarService.addComment(eventId, comment, isPrivate);
      toast.success('Kommentar wurde hinzugefügt');
      // Events neu laden um aktualisierte Kommentare zu erhalten
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kommentars:', error);
      toast.error('Kommentar konnte nicht hinzugefügt werden');
    }
  };

  // Kategorien nach Farbe filtern
  const getCategoriesByColor = (color: string) => {
    return categories.filter(cat => cat.color === color);
  };

  // Events nach Kategorie filtern
  const getEventsByCategory = (events: CalendarEvent[], categoryId: string) => {
    return events.filter(event => event.category_id === categoryId);
  };

  // Standard-Erinnerungszeiten
  const defaultReminderOptions = [
    { label: '5 Minuten', value: '5 minutes' },
    { label: '15 Minuten', value: '15 minutes' },
    { label: '30 Minuten', value: '30 minutes' },
    { label: '1 Stunde', value: '1 hour' },
    { label: '2 Stunden', value: '2 hours' },
    { label: '1 Tag', value: '1 day' },
    { label: '1 Woche', value: '1 week' }
  ];

  return {
    // Daten
    categories,
    userSettings,
    defaultReminderOptions,
    
    // Ladezustände
    categoriesLoading,
    settingsLoading,
    isCreatingCategory: createCategoryMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    
    // Aktionen
    createCategory: createCategoryMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    sendInvitation,
    addReminders,
    addComment,
    refetchCategories,
    
    // Hilfsfunktionen
    getCategoriesByColor,
    getEventsByCategory
  };
};
