import { format, startOfYear, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { CalendarEvent } from "./CalendarWeekGrid";

interface CalendarYearGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onMonthClick?: (date: Date) => void;
}

export function CalendarYearGrid({
  currentDate,
  events,
  onMonthClick,
}: CalendarYearGridProps) {
  const yearStart = startOfYear(currentDate);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const getEventsForMonth = (month: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      return isSameMonth(eventStart, month);
    });
  };

  const renderMiniMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const monthEvents = getEventsForMonth(month);

    return (
      <Card 
        className="p-3 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => onMonthClick?.(month)}
      >
        <div className="text-center font-semibold mb-2 text-sm">
          {format(month, "MMMM", { locale: de })}
        </div>
        
        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["M", "D", "M", "D", "F", "S", "S"].map((dayName, index) => (
            <div
              key={index}
              className="text-center text-[10px] text-muted-foreground"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Mini-Kalender */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, month);
              const isDayToday = isToday(day);
              const hasEvents = events.some(e => isSameDay(new Date(e.start), day));

              return (
                <div
                  key={dayIndex}
                  className={`
                    text-[10px] text-center py-1 rounded
                    ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'}
                    ${isDayToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                    ${hasEvents && !isDayToday ? 'bg-accent font-medium' : ''}
                  `}
                >
                  {format(day, "d", { locale: de })}
                </div>
              );
            })}
          </div>
        ))}

        {/* Event-Zähler */}
        {monthEvents.length > 0 && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            {monthEvents.length} {monthEvents.length === 1 ? 'Termin' : 'Termine'}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="m-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">
          {format(currentDate, "yyyy", { locale: de })}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((month, index) => (
          <div key={index}>
            {renderMiniMonth(month)}
          </div>
        ))}
      </div>
    </div>
  );
}
