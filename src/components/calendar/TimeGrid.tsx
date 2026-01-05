
import { format } from 'date-fns';

interface TimeGridProps {
  hours: number[];
  currentTime: number | null;
}

const TimeGrid = ({ hours, currentTime }: TimeGridProps) => {
  return (
    <div className="flex">
      {/* Zeitspalte */}
      <div className="w-24 flex-shrink-0">
        {hours.map(hour => (
          <div key={hour} className="h-32 border-b border-gray-100 relative">
            <span className="absolute -top-3 left-2 text-sm text-gray-500">
              {`${hour.toString().padStart(2, '0')}:00`}
            </span>
          </div>
        ))}
      </div>

      {/* Hauptbereich für Termine */}
      <div className="flex-1 relative">
        {hours.map(hour => (
          <div key={hour} className="h-32 border-b border-gray-100" />
        ))}
        
        {currentTime !== null && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-blue-500 z-10"
            style={{ top: `${currentTime * 128}px` }}
          >
            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeGrid;
