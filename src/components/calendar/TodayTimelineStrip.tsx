import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface TodayTimelineStripProps {
  events: CalendarEvent[];
}

const TodayTimelineStrip = ({ events }: TodayTimelineStripProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = new Date().getHours();

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      left: `${(startHour / 24) * 100}%`,
      width: `${(duration / 24) * 100}%`,
    };
  };

  return (
    <div className="relative">
      {/* Zeitraster */}
      <div className="flex items-center border-b pb-2 mb-4">
        {hours.map(hour => (
          <div 
            key={hour} 
            className={`flex-1 text-xs text-center ${hour === currentHour ? 'font-bold text-primary' : 'text-muted-foreground'}`}
          >
            {hour.toString().padStart(2, '0')}
          </div>
        ))}
      </div>

      {/* Zeitmarker (aktuelle Uhrzeit) */}
      <div 
        className="absolute top-0 h-full w-0.5 bg-destructive z-10"
        style={{ left: `${(currentHour + new Date().getMinutes() / 60) / 24 * 100}%` }}
      >
        <div className="absolute -top-2 -left-1 w-3 h-3 bg-destructive rounded-full" />
      </div>

      {/* Events */}
      <div className="relative h-24">
        {events.map(event => {
          const position = getEventPosition(event);
          return (
            <div
              key={event.id}
              className="absolute h-20 rounded-md p-2 text-xs overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              style={{
                ...position,
                backgroundColor: event.color || '#3B82F6',
                opacity: 0.9,
              }}
            >
              <div className="font-medium text-white truncate">{event.title}</div>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {event.type}
              </Badge>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Keine Termine heute
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayTimelineStrip;