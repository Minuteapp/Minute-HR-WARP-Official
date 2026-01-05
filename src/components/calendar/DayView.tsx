
import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DayViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date;
}

const DayView = ({ events, onEventClick, selectedDate }: DayViewProps) => {
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    
    return {
      top: (startMinutes / 60) * 60, // 60px per hour
      height: Math.max((duration / 60) * 60, 30) // minimum 30px height
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
      {/* Header mit Datum */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
          </h2>
          <p className="text-sm text-gray-600">Ganztägig</p>
        </div>
        <div className="flex space-x-2">
          <button className="text-sm text-blue-600 hover:underline">Heute</button>
        </div>
      </div>
      
      {/* Zeitraster */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-100" style={{ height: '60px' }}>
              <div className="w-20 flex-shrink-0 p-2 text-sm text-gray-500 text-right border-r">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
              <div className="flex-1 relative"></div>
            </div>
          ))}
          
          {/* Events positioniert über dem Zeitraster */}
          <div className="absolute inset-0 ml-20">
            {dayEvents.map(event => {
              const position = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  className={`absolute left-2 right-2 p-2 rounded cursor-pointer hover:shadow-md transition-shadow ${getEventColor(event.type)}`}
                  style={{
                    top: `${position.top}px`,
                    height: `${position.height}px`
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="text-sm font-medium">{format(new Date(event.start), 'HH:mm')}</div>
                  <div className="text-sm font-semibold">{event.title}</div>
                  {event.location && (
                    <div className="text-xs opacity-90">{event.location}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rechte Seitenleiste für Details */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gray-50 border-l p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
          </h3>
        </div>
        
        <div className="space-y-3">
          {dayEvents.length > 0 ? (
            dayEvents.map((event) => (
              <div key={event.id} className="p-3 border rounded-lg bg-white">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                </p>
                {event.location && (
                  <p className="text-sm text-gray-500">{event.location}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Keine Termine für diesen Tag</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;
