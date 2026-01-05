
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: () => void;
  getEventIcon?: (type: string) => React.ReactNode;
}

const DayView: React.FC<DayViewProps> = ({ 
  date, 
  events, 
  onEventClick,
  onNewEvent,
  getEventIcon 
}) => {
  // Einfache Stundenraster für Tagesansicht
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.getHours() === hour;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">
        {format(date, 'EEEE, dd. MMMM yyyy', { locale: de })}
      </h2>
      
      <div className="space-y-2">
        {hours.map(hour => (
          <div key={hour} className="flex border-t border-gray-200 pt-2">
            <div className="w-16 text-sm text-gray-500">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div className="flex-1">
              {getEventsForHour(hour).map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick && onEventClick(event)}
                  className="p-2 mb-1 rounded bg-blue-100 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {getEventIcon && getEventIcon(event.type)}
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;
