
import { CalendarEvent } from '@/types/calendar';
import { format, startOfYear, addMonths, getDaysInMonth, startOfMonth, addDays, isSameDay, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface YearViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
}

const YearView = ({ events, onEventClick, selectedDate, onDateSelect }: YearViewProps) => {
  const yearStart = startOfYear(selectedDate);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start), day));
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const daysInMonth = getDaysInMonth(month);
    const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i));
    
    const weekDays = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];

    return (
      <div key={month.toISOString()} className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-red-500 mb-3">
          {format(month, 'MMMM', { locale: de })}
        </h3>
        
        {/* Wochentage Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, idx) => (
            <div key={`${day}-${idx}`} className="text-xs font-medium text-gray-600 text-center p-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Tage Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Vormonatstage */}
          {(() => {
            const leading = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
            const prevMonthDays = Array.from({ length: leading }, (_, i) => addDays(monthStart, -(leading - i)));
            return prevMonthDays.map((d, i) => (
              <div key={`prev-${i}`} className="w-6 h-6 text-xs flex items-center justify-center text-gray-300">
                {format(d, 'd')}
              </div>
            ));
          })()}

          {/* Aktueller Monat */}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isTodayDay = isToday(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={`w-6 h-6 text-xs flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded ${
                  isTodayDay ? 'bg-red-500 text-white rounded-full' : ''
                } ${hasEvents ? 'font-bold' : ''}`}
                onClick={() => onDateSelect?.(day)}
              >
                {format(day, 'd')}
              </div>
            );
          })}

          {/* Nachmonatstage */}
          {(() => {
            const leading = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
            const totalCells = 42; // 6 Zeilen * 7 Spalten
            const trailing = totalCells - (leading + daysInMonth);
            const nextMonthDays = Array.from({ length: trailing }, (_, i) => addDays(monthStart, daysInMonth + i));
            return nextMonthDays.map((d, i) => (
              <div key={`next-${i}`} className="w-6 h-6 text-xs flex items-center justify-center text-gray-300">
                {format(d, 'd')}
              </div>
            ));
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(selectedDate, 'yyyy', { locale: de })}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map(renderMonth)}
      </div>
    </div>
  );
};

export default YearView;
