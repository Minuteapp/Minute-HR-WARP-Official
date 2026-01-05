
import { CalendarEvent } from '@/types/calendar';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface WeekViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date;
}

const WeekView = ({ events, onEventClick, selectedDate }: WeekViewProps) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start), day));
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    
    return {
      top: (startMinutes / 60) * 60,
      height: Math.max((duration / 60) * 60, 30)
    };
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-red-400 text-white',
      personal: 'bg-green-400 text-white', 
      appointment: 'bg-blue-400 text-white',
      training: 'bg-purple-400 text-white',
      holiday: 'bg-yellow-400 text-white'
    };
    return colors[type] || 'bg-gray-400 text-white';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header mit Wochentagen */}
      <div className="border-b bg-gray-50">
        <div className="flex">
          <div className="w-20 flex-shrink-0 p-3 border-r">
            <div className="text-sm text-gray-600">Ganztägig</div>
            <div className="text-xs text-gray-500 mt-1">Geburtstag Mama</div>
          </div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="flex-1 p-3 text-center border-r last:border-r-0">
              <div className="text-sm text-gray-600">{format(day, 'EE', { locale: de })}</div>
              <div className={`text-lg font-semibold ${
                isSameDay(day, new Date()) ? 'bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Zeitraster */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-100" style={{ height: '60px' }}>
              <div className="w-20 flex-shrink-0 p-2 text-sm text-gray-500 text-center border-r">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
              {weekDays.map(day => (
                <div key={`${day.toISOString()}-${hour}`} className="flex-1 relative border-r last:border-r-0"></div>
              ))}
            </div>
          ))}
          
          {/* Events */}
          <div className="absolute inset-0 ml-20">
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="absolute"
                  style={{
                    left: `${(dayIndex / 7) * 100}%`,
                    width: `${100 / 7}%`,
                    height: '100%'
                  }}
                >
                  {dayEvents.map(event => {
                    const position = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 p-1 rounded cursor-pointer hover:shadow-md transition-shadow text-xs ${getEventColor(event.type)}`}
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="font-medium">{format(new Date(event.start), 'HH:mm')}</div>
                        <div className="font-semibold">{event.title}</div>
                        {event.location && (
                          <div className="opacity-90">{event.location}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
