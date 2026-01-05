
import { CalendarEvent } from '@/types/calendar';
import DayEventItem from './DayEventItem';

interface DayViewEventsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const DayViewEvents = ({ events, onEventClick }: DayViewEventsProps) => {
  return (
    <div className="absolute top-0 left-[100px] right-4">
      {events.map(event => (
        <DayEventItem
          key={event.id}
          event={event}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
};

export default DayViewEvents;
