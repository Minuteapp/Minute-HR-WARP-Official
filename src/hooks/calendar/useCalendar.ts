
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CalendarEvent, NewEvent, CalendarViewType } from '@/types/calendar';
import { calendarService } from '@/services/calendarService';
import { useToast } from '@/hooks/use-toast';

export const useCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: events = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => calendarService.getEvents(),
    refetchInterval: 30000,
    retry: 3
  });

  const {
    data: todayEvents = [],
    isLoading: isLoadingTodayEvents
  } = useQuery({
    queryKey: ['today-events'],
    queryFn: calendarService.getTodayEvents,
    refetchInterval: 60000
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData: Partial<CalendarEvent>) => calendarService.createEvent(eventData),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['today-events'] });
      toast({
        title: "Termin erstellt",
        description: "Der Termin wurde erfolgreich erstellt.",
      });
      setShowNewEventDialog(false);
    },
    onError: (error) => {
      console.error('Fehler beim Erstellen des Termins:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Termin konnte nicht erstellt werden.",
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewEvent> }) => {
      const { documents, ...eventData } = data;
      return calendarService.updateEvent(id, eventData as Partial<CalendarEvent>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['today-events'] });
      toast({
        title: "Termin aktualisiert",
        description: "Der Termin wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      console.error('Fehler beim Aktualisieren des Termins:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Termin konnte nicht aktualisiert werden.",
      });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: calendarService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['today-events'] });
      toast({
        title: "Termin gelöscht",
        description: "Der Termin wurde erfolgreich gelöscht.",
      });
      setSelectedEvent(null);
    },
    onError: (error) => {
      console.error('Fehler beim Löschen des Termins:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Termin konnte nicht gelöscht werden.",
      });
    }
  });

  const handleCreateEvent = async (eventData: NewEvent) => {
    const { documents, ...calendarEventData } = eventData;
    return await createEventMutation.mutateAsync(calendarEventData as Partial<CalendarEvent>);
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<NewEvent>) => {
    updateEventMutation.mutate({ id, data: eventData });
  };

  const handleDeleteEvent = async (id: string) => {
    deleteEventMutation.mutate(id);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView('day');
  };

  return {
    // Data
    events,
    todayEvents,
    selectedEvent,
    selectedDate,
    view,
    showNewEventDialog,
    
    // Loading states
    isLoading: isLoading || isLoadingTodayEvents,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    setSelectedDate,
    setView,
    setSelectedEvent,
    setShowNewEventDialog,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleEventClick,
    handleDateSelect,
    refetch
  };
};
