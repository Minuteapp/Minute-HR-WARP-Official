
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface CalendarEventListProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  selectedTypes: Record<string, boolean>;
}

const CalendarEventList = ({ events, onEventClick, selectedTypes }: CalendarEventListProps) => {
  // Funktion zum Abrufen der Farbklassen basierend auf der Ereignisfarbe
  const getEventColorClasses = (color: string = 'blue') => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-100 hover:bg-blue-200 border-blue-300',
      'purple': 'bg-purple-100 hover:bg-purple-200 border-purple-300',
      'pink': 'bg-pink-100 hover:bg-pink-200 border-pink-300',
      'orange': 'bg-orange-100 hover:bg-orange-200 border-orange-300',
      'yellow': 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
      'green': 'bg-green-100 hover:bg-green-200 border-green-300',
      'red': 'bg-red-100 hover:bg-red-200 border-red-300',
      'indigo': 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300'
    };
    return colorMap[color] || colorMap.blue;
  };

  const filteredEvents = events.filter(event => selectedTypes[event.type]);

  return (
    <div className="space-y-2">
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventClick(event)}
          className={cn(
            "p-3 rounded border cursor-pointer",
            getEventColorClasses(event.color)
          )}
        >
          <div className="font-medium">{event.title}</div>
          <div className="text-sm text-gray-600">
            {format(event.start, 'EEEE, d. MMMM yyyy', { locale: de })}
          </div>
          <div className="text-sm text-gray-600">
            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
          </div>
          {(event.location || event.address) && (
            <div className="text-sm text-gray-600 mt-1 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{event.location || event.address}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CalendarEventList;
