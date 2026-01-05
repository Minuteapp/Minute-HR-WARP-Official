
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayEventItemProps {
  event: CalendarEvent;
  onEventClick: (event: CalendarEvent) => void;
}

const DayEventItem = ({ event, onEventClick }: DayEventItemProps) => {
  // Funktion zum Abrufen der Farbklassen basierend auf der Ereignisfarbe
  const getEventColorClasses = (color: string = 'blue') => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900',
      'purple': 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900',
      'pink': 'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-900',
      'orange': 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900',
      'yellow': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-900',
      'green': 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900',
      'red': 'bg-red-50 border-red-200 hover:bg-red-100 text-red-900',
      'indigo': 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Stellen wir sicher, dass wir mit Date-Objekten arbeiten
  const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start;
  const endDate = typeof event.end === 'string' ? new Date(event.end) : event.end;
  
  const startHour = startDate.getHours() + (startDate.getMinutes() / 60);
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

  return (
    <div
      onClick={() => onEventClick(event)}
      className={cn(
        "absolute left-0 right-2 p-2 rounded-lg cursor-pointer shadow-sm transition-all",
        "border hover:shadow-md",
        getEventColorClasses(event.color)
      )}
      style={{
        top: `${startHour * 60}px`,
        height: `${duration * 60}px`,
        minHeight: '32px',
      }}
    >
      <div className="font-medium text-sm truncate">
        {event.title}
      </div>
      <div className="text-xs opacity-75">
        {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
      </div>
      {event.location && (
        <div className="text-xs mt-1 opacity-75 flex items-center">
          <MapPin className="h-3 w-3 mr-1 inline-block" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
      {event.participants && event.participants.length > 0 && (
        <div className="text-xs mt-1 opacity-75">
          {event.participants.length} Teilnehmer
        </div>
      )}
    </div>
  );
};

export default DayEventItem;
