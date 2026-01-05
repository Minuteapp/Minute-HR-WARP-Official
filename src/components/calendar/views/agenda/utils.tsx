
import { CalendarEvent } from '@/types/calendar';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, isBefore, startOfDay, endOfDay, addMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
import { EventsByDate } from './types';

// Formatiert Datum für die Anzeige
export const formatDateHeader = (dateStr: string) => {
  const eventDate = new Date(dateStr);
  
  if (isToday(eventDate)) {
    return `Heute, ${format(eventDate, 'EEEE, d. MMMM', { locale: de })}`;
  } else if (isTomorrow(eventDate)) {
    return `Morgen, ${format(eventDate, 'EEEE, d. MMMM', { locale: de })}`;
  } else if (isThisWeek(eventDate)) {
    return format(eventDate, 'EEEE, d. MMMM', { locale: de });
  } else if (isThisMonth(eventDate)) {
    return format(eventDate, 'EEEE, d. MMMM', { locale: de });
  } else {
    return format(eventDate, 'EEEE, d. MMMM yyyy', { locale: de });
  }
};

// Zeitformatierung
export const formatEventTime = (event: CalendarEvent) => {
  const start = typeof event.start === 'string' ? new Date(event.start) : event.start;
  const end = typeof event.end === 'string' ? new Date(event.end) : event.end;
  
  if (event.allDay || event.isAllDay) {
    return 'Ganztägig';
  }
  
  return `${format(start, 'HH:mm', { locale: de })} - ${format(end, 'HH:mm', { locale: de })}`;
};

// Wählt eine Hintergrundfarbe basierend auf dem Ereignistyp
export const getEventColor = (type: string) => {
  switch(type) {
    case 'meeting': return 'bg-blue-50 border-blue-200';
    case 'appointment': return 'bg-indigo-50 border-indigo-200';
    case 'call': return 'bg-green-50 border-green-200';
    case 'training': return 'bg-amber-50 border-amber-200';
    case 'interview': return 'bg-purple-50 border-purple-200';
    case 'holiday': return 'bg-emerald-50 border-emerald-200';
    case 'task': return 'bg-rose-50 border-rose-200';
    case 'deadline': return 'bg-red-50 border-red-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

// Statusindikator für Events
export const getEventStatusIcon = (event: CalendarEvent) => {
  if (event.type === 'task') {
    // Überprüfen, ob dem Ereignis eine Eigenschaft für den Abgeschlossenstatus hat
    const isCompleted = event.completed === true;
    
    if (isCompleted) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>Erledigt</TooltipContent>
        </Tooltip>
      );
    } 
    
    // Prüfe, ob das Event überfällig ist
    const now = new Date();
    const end = typeof event.end === 'string' ? new Date(event.end) : event.end;
    if (end < now) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>Überfällig</TooltipContent>
        </Tooltip>
      );
    }
  }
  
  return null;
};

// Filter und sortiere Events für die nächsten 3 Monate
export const filterAndSortEvents = (events: CalendarEvent[], date: Date) => {
  const startDate = startOfDay(date);
  const endDate = endOfDay(addMonths(date, 3));
  
  return events
    .filter(event => {
      const eventStart = typeof event.start === 'string' ? new Date(event.start) : event.start;
      return !isBefore(eventStart, startDate) && !isBefore(endDate, eventStart);
    })
    .sort((a, b) => {
      const dateA = typeof a.start === 'string' ? new Date(a.start) : a.start;
      const dateB = typeof b.start === 'string' ? new Date(b.start) : b.start;
      return dateA.getTime() - dateB.getTime();
    });
};

// Gruppiere Ereignisse nach Datum
export const groupEventsByDate = (events: CalendarEvent[]): EventsByDate => {
  return events.reduce((acc, event) => {
    const eventDate = typeof event.start === 'string' ? new Date(event.start) : event.start;
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(event);
    return acc;
  }, {} as EventsByDate);
};
