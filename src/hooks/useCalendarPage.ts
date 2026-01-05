
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useOutlookCalendar } from '@/hooks/useOutlookCalendar';
import { useCalendarWithTaskDeadlines } from '@/hooks/calendar/useCalendarWithTaskDeadlines';
import { useCalendarUI } from '@/hooks/calendar/useCalendarUI';

export const useCalendarPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const eventIdFromUrl = searchParams.get('eventId');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    view, setView,
    selectedEvent, setSelectedEvent,
    selectedDate, setSelectedDate,
    showNewEventDialog, setShowNewEventDialog,
    showSettings, setShowSettings,
    showAIDialog, setShowAIDialog,
    selectedTypes, setSelectedTypes,
    handleDateSelect
  } = useCalendarUI();
  
  const { events: outlookEvents, isLoading: outlookLoading } = useOutlookCalendar();
  
  const {
    localEvents,
    setLocalEvents,
    newEvent,
    setNewEvent,
    handleSaveNewEvent,
    taskDeadlineEvents,
    isLoading: localEventsLoading
  } = useCalendarWithTaskDeadlines();

  // Alle Events kombinieren
  const allEvents = [...(localEvents || []), ...(outlookEvents || [])];

  // Gesamtladeindikator
  const combinedLoading = outlookLoading || localEventsLoading || isLoading;

  return {
    view,
    setView,
    selectedEvent,
    setSelectedEvent,
    selectedDate,
    setSelectedDate,
    showNewEventDialog,
    setShowNewEventDialog,
    showSettings,
    setShowSettings,
    showAIDialog,
    setShowAIDialog,
    selectedTypes,
    setSelectedTypes,
    outlookEvents,
    outlookLoading,
    localEvents,
    setLocalEvents,
    newEvent,
    setNewEvent,
    handleDateSelect,
    handleSaveNewEvent,
    taskDeadlineEvents,
    allEvents,
    isLoading: combinedLoading
  };
};
