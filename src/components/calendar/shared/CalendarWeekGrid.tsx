import { format, startOfWeek, addDays, addHours, isSameDay, isSameHour } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  category?: string;
  location?: string;
  description?: string;
  participants?: string[];
}

interface CalendarWeekGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  zoomLevel: number;
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  workWeekOnly?: boolean;
}

export function CalendarWeekGrid({
  currentDate,
  events,
  zoomLevel,
  onEventClick,
  onTimeSlotClick,
  workWeekOnly = false,
}: CalendarWeekGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const daysCount = workWeekOnly ? 5 : 7;
  const days = Array.from({ length: daysCount }, (_, i) => addDays(weekStart, i));

  const getEventsForTimeSlot = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      return (
        isSameDay(eventStart, day) &&
        eventStart.getHours() === hour
      );
    });
  };

  const getEventDuration = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return durationHours;
  };

  const baseMinHeight = 52;
  const scaledMinHeight = baseMinHeight * zoomLevel;
  const gridCols = workWeekOnly ? "grid-cols-6" : "grid-cols-8";

  return (
    <div className="m-4">
      <Card className="overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]" style={{ fontSize: `${zoomLevel}rem` }}>
        {/* Header mit Tagen */}
        <div className={`grid ${gridCols} border-b sticky top-0 bg-background z-10`}>
          <div className="border-r p-3 bg-background"></div>
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className="border-r p-3 text-center"
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: de })}
                </div>
                <div className={`text-lg font-medium ${isToday ? 'text-primary' : ''}`}>
                  {format(day, "d", { locale: de })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zeitraster */}
        {hours.map((hour) => (
          <div key={hour} className={`grid ${gridCols} border-b hover:bg-muted/20`}>
            <div className="border-r p-2 text-right text-xs text-muted-foreground">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const eventsInSlot = getEventsForTimeSlot(day, hour);

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="border-r p-1 hover:bg-accent/30 cursor-pointer relative"
                  style={{ minHeight: `${scaledMinHeight}px` }}
                  onClick={() => onTimeSlotClick?.(day, hour)}
                >
                  {eventsInSlot.map((event) => {
                    const duration = getEventDuration(event);
                    const heightMultiplier = Math.max(1, duration);

                    return (
                      <div
                        key={event.id}
                        className="px-2 py-1 mb-1 rounded hover:shadow-sm transition-all cursor-pointer text-white font-medium"
                        style={{
                          backgroundColor: event.color,
                          minHeight: `${heightMultiplier * 48 * zoomLevel}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="text-xs font-medium truncate">
                          {event.title}
                        </div>
                      </div>
                    );
                  })}
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
