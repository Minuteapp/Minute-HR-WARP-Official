import { useState } from "react";
import { CalendarView } from "@/components/CalendarModule";
import { CalendarWeekGrid, CalendarEvent } from "./CalendarWeekGrid";
import { CalendarDayGrid } from "./CalendarDayGrid";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarYearGrid } from "./CalendarYearGrid";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CalendarEventDetails from "../CalendarEventDetails";

interface CalendarViewRendererProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  events: CalendarEvent[];
  zoomLevel: number;
}

export function CalendarViewRenderer({
  view,
  currentDate,
  setCurrentDate,
  events,
  zoomLevel,
}: CalendarViewRendererProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    console.log("Time slot clicked:", date, hour);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
  };

  const handleMonthClick = (date: Date) => {
    setCurrentDate(date);
  };

  // Convert CalendarEvent to the format expected by CalendarEventDetails
  const convertToDetailsEvent = (event: CalendarEvent) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    type: event.category || 'meeting',
    color: event.color,
    location: event.location,
    description: event.description,
    participants: event.participants || [],
    allDay: false,
  });

  const renderView = () => {
    // Tagesansicht
    if (view === "day") {
      return (
        <CalendarDayGrid
          currentDate={currentDate}
          events={events}
          zoomLevel={zoomLevel}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      );
    }

    // Wochenansicht (normale Woche)
    if (view === "week") {
      return (
        <CalendarWeekGrid
          currentDate={currentDate}
          events={events}
          zoomLevel={zoomLevel}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      );
    }

    // Arbeitswoche (Mo-Fr)
    if (view === "work-week") {
      return (
        <CalendarWeekGrid
          currentDate={currentDate}
          events={events}
          zoomLevel={zoomLevel}
          onEventClick={handleEventClick}
          onTimeSlotClick={handleTimeSlotClick}
          workWeekOnly={true}
        />
      );
    }

    // Monatsansicht
    if (view === "month") {
      return (
        <CalendarMonthGrid
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
      );
    }

    // Jahresansicht
    if (view === "year") {
      return (
        <CalendarYearGrid
          currentDate={currentDate}
          events={events}
          onMonthClick={handleMonthClick}
        />
      );
    }

    return null;
  };

  return (
    <>
      {renderView()}
      
      {/* Event Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[540px] p-0">
          {selectedEvent && (
            <CalendarEventDetails event={convertToDetailsEvent(selectedEvent)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
