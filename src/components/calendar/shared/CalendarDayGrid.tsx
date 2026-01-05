import { format, addHours, isSameHour } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { CalendarEvent } from "./CalendarWeekGrid";

interface CalendarDayGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  zoomLevel: number;
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function CalendarDayGrid({
  currentDate,
  events,
  zoomLevel,
  onEventClick,
  onTimeSlotClick,
}: CalendarDayGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForTimeSlot = (hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      return eventStart.getHours() === hour;
    });
  };

  const getEventDuration = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return durationHours;
  };

  const baseMinHeight = 80;
  const scaledMinHeight = baseMinHeight * zoomLevel;

  return (
    <div className="m-4">
      <Card className="overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="min-w-[600px]" style={{ fontSize: `${zoomLevel}rem` }}>
            {/* Header mit Datum */}
            <div className="border-b sticky top-0 bg-background z-10 p-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase">
                  {format(currentDate, "EEEE", { locale: de })}
                </div>
                <div className="text-2xl font-bold">
                  {format(currentDate, "d. MMMM yyyy", { locale: de })}
                </div>
              </div>
            </div>

            {/* Zeitraster */}
            {hours.map((hour) => {
              const eventsInSlot = getEventsForTimeSlot(hour);

              return (
                <div key={hour} className="grid grid-cols-[80px_1fr] border-b hover:bg-muted/20">
                  <div className="border-r p-3 text-right text-sm font-medium text-muted-foreground">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  <div
                    className="p-2 hover:bg-accent/30 cursor-pointer relative"
                    style={{ minHeight: `${scaledMinHeight}px` }}
                    onClick={() => onTimeSlotClick?.(currentDate, hour)}
                  >
                    {eventsInSlot.map((event) => {
                      const duration = getEventDuration(event);
                      const heightMultiplier = Math.max(1, duration);

                      return (
                        <div
                          key={event.id}
                          className="px-3 py-2 mb-2 rounded-lg hover:shadow-md transition-all cursor-pointer text-white"
                          style={{
                            backgroundColor: event.color,
                            minHeight: `${heightMultiplier * 72 * zoomLevel}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="font-semibold text-sm mb-1">
                            {event.title}
                          </div>
                          {event.location && (
                            <div className="text-xs opacity-90">
                              📍 {event.location}
                            </div>
                          )}
                          <div className="text-xs opacity-90 mt-1">
                            {format(new Date(event.start), "HH:mm", { locale: de })} - {format(new Date(event.end), "HH:mm", { locale: de })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
