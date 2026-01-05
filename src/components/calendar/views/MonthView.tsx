
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  onNewEvent?: () => void;
  getEventIcon?: (type: string) => React.ReactNode;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  date, 
  events, 
  onEventClick,
  onDateSelect,
  onNewEvent,
  getEventIcon 
}) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div 
            key={day.toString()}
            onClick={() => onDateSelect && onDateSelect(day)}
            className={cn(
              "h-24 p-1 border rounded hover:bg-gray-50 cursor-pointer",
              !isSameMonth(day, date) && "bg-gray-50 text-gray-400",
              isSameDay(day, new Date()) && "bg-blue-50 border-blue-300"
            )}
          >
            <div className="text-right text-sm">{format(day, 'd')}</div>
            <div className="mt-1 space-y-1">
              {getEventsForDay(day).slice(0, 2).map(event => (
                <div 
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick && onEventClick(event);
                  }}
                  className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate flex items-center"
                >
                  {getEventIcon && getEventIcon(event.type)}
                  <span className="ml-1 truncate">{event.title}</span>
                </div>
              ))}
              {getEventsForDay(day).length > 2 && (
                <div className="text-xs text-gray-500">
                  +{getEventsForDay(day).length - 2} weitere
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
