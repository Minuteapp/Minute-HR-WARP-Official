
import { CalendarEvent } from '@/types/calendar';

export interface EventsByDate {
  [date: string]: CalendarEvent[];
}

export interface AgendaEventItemProps {
  event: CalendarEvent;
  getEventColor: (type: string) => string;
  getEventStatusIcon: (event: CalendarEvent) => React.ReactNode;
  formatEventTime: (event: CalendarEvent) => string;
  handleCompleteTask?: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventClick?: (event: CalendarEvent) => void;
  getEventIcon?: (type: string) => React.ReactNode;
}

export interface AgendaDateGroupProps {
  dateKey: string;
  events: CalendarEvent[];
  formatDateHeader: (dateKey: string) => string;
  formatEventTime: (event: CalendarEvent) => string;
  getEventColor: (type: string) => string;
  getEventStatusIcon: (event: CalendarEvent) => React.ReactNode;
  handleCompleteTask?: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventClick?: (event: CalendarEvent) => void;
  getEventIcon?: (type: string) => React.ReactNode;
}
