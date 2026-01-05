
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: () => void;
  getEventIcon?: (type: string) => React.ReactNode;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  date, 
  events, 
  onEventClick,
  onNewEvent,
  getEventIcon 
}) => {
  const startDay = startOfWeek(date, { weekStartsOn: 1 }); // Woche beginnt Montag
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-4 mb-4">
        {weekDays.map(day => (
          <div key={day.toString()} className="text-center">
            <div className="text-sm font-medium">
              {format(day, 'EEEE', { locale: de })}
            </div>
            <div className="text-lg font-bold">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={day.toString()} className="min-h-[400px] border rounded-lg p-2">
            {getEventsForDay(day).map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick && onEventClick(event)}
                className="p-2 mb-2 rounded bg-blue-100 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  {getEventIcon && getEventIcon(event.type)}
                  <span className="font-medium text-sm">{event.title}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
