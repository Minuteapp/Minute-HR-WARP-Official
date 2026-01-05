
import { CalendarEvent, CalendarViewType } from "@/types/calendar";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import YearView from "./YearView";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CalendarEventDetails from "./CalendarEventDetails";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface CalendarContentProps {
  view: CalendarViewType;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
  selectedTypes: Record<string, boolean>;
  isLoading: boolean;
}

const CalendarContent = ({
  view,
  events,
  onEventClick,
  selectedDate,
  onDateSelect,
  selectedTypes,
  isLoading,
}: CalendarContentProps) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
    onEventClick(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Lade Kalendertermine...</span>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-16rem)]">
        {view === 'day' && (
          <DayView
            events={events}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
          />
        )}
        {view === 'week' && (
          <WeekView
            events={events}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
          />
        )}
        {view === 'month' && (
          <MonthView
            events={events}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
          />
        )}
        {view === 'year' && (
          <YearView
            events={events}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
          />
        )}
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] p-0">
          {selectedEvent && <CalendarEventDetails event={selectedEvent} />}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CalendarContent;
