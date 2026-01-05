import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { CalendarEvent } from "./CalendarWeekGrid";

interface CalendarMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export function CalendarMonthGrid({
  currentDate,
  events,
  onEventClick,
  onDayClick,
}: CalendarMonthGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
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

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, date);
    });
  };

  return (
    <div className="m-4">
      <Card className="overflow-hidden">
        <div className="p-4">
          {/* Header mit Wochentagen */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((dayName, index) => (
              <div
                key={index}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Kalender-Raster */}
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        min-h-[120px] p-2 rounded-lg border-2 cursor-pointer transition-all
                        ${isCurrentMonth ? 'bg-background hover:bg-accent/50' : 'bg-muted/30'}
                        ${isDayToday ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}
                      `}
                      onClick={() => onDayClick?.(day)}
                    >
                      <div className={`
                        text-sm font-semibold mb-2
                        ${isDayToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {format(day, "d", { locale: de })}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="px-2 py-1 rounded text-white text-xs font-medium truncate hover:shadow-sm transition-all"
                            style={{ backgroundColor: event.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick?.(event);
                            }}
                          >
                            {format(new Date(event.start), "HH:mm", { locale: de })} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{dayEvents.length - 3} weitere
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
