
import TimeGridHour from './TimeGridHour';
import CurrentTimeIndicator from './CurrentTimeIndicator';

interface TimeGridProps {
  hours: number[];
  currentTime: number | null;
}

const TimeGrid = ({ hours, currentTime }: TimeGridProps) => {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4">
      {hours.map(hour => (
        <TimeGridHour key={hour} hour={hour} />
      ))}
      <CurrentTimeIndicator currentTime={currentTime} />
    </div>
  );
};

export default TimeGrid;
