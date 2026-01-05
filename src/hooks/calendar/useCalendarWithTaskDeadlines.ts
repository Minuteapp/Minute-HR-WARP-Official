
import { useMemo } from 'react';
import { useCalendarEvents } from './useCalendarEvents';
import { useTaskDeadlineIntegration } from './useTaskDeadlineIntegration';
import { CalendarEvent } from '@/types/calendar';

/**
 * Hook der reguläre Kalenderereignisse mit Aufgaben-Deadlines kombiniert
 */
export const useCalendarWithTaskDeadlines = () => {
  const { localEvents, isLoading: calendarLoading, ...calendarRest } = useCalendarEvents();
  const { data: taskDeadlineEvents, isLoading: taskDeadlineLoading } = useTaskDeadlineIntegration();

  // Alle Events kombinieren
  const combinedEvents = useMemo(() => {
    const regularEvents = localEvents || [];
    const deadlineEvents = taskDeadlineEvents || [];
    
    return [...regularEvents, ...deadlineEvents];
  }, [localEvents, taskDeadlineEvents]);

  const isLoading = calendarLoading || taskDeadlineLoading;

  return {
    ...calendarRest,
    localEvents: combinedEvents,
    taskDeadlineEvents: taskDeadlineEvents || [],
    isLoading,
  };
};
