
import { CalendarEvent } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface MonthViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
}

const MonthView = ({ events, onEventClick, selectedDate, onDateSelect }: MonthViewProps) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let currentDate = calendarStart;
  
  while (currentDate <= calendarEnd) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start), day));
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-red-400',
      personal: 'bg-green-400',
      appointment: 'bg-blue-400', 
      training: 'bg-purple-400',
      holiday: 'bg-yellow-400'
    };
    return colors[type] || 'bg-gray-400';
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header mit Monatsname */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'MMMM yyyy', { locale: de })}
        </h2>
      </div>

      {/* Wochentage Header */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Kalender-Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelectedDay = isSameDay(day, selectedDate);
          const isTodayDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px] ${
                !isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''
              } ${isSelectedDay ? 'bg-blue-50' : ''}`}
              onClick={() => onDateSelect?.(day)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isTodayDay ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded text-white truncate cursor-pointer ${getEventColor(event.type)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="font-medium">{format(new Date(event.start), 'HH:mm')}</div>
                    <div>{event.title}</div>
                    {event.location && (
                      <div className="opacity-80">{event.location}</div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 2} weitere
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
