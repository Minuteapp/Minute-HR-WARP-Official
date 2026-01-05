
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DayViewHeaderProps {
  selectedDate: Date;
  eventCount: number;
}

const DayViewHeader = ({ selectedDate, eventCount }: DayViewHeaderProps) => {
  const isToday = () => {
    const today = new Date();
    return (
      today.getDate() === selectedDate.getDate() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            {format(selectedDate, 'EEEE', { locale: de })}
          </h3>
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                "text-2xl font-bold",
                isToday() && "text-primary"
              )}
            >
              {format(selectedDate, 'd', { locale: de })}
            </div>
            <div className="text-gray-500">
              {format(selectedDate, 'MMMM yyyy', { locale: de })}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
          {eventCount} {eventCount === 1 ? 'Termin' : 'Termine'}
        </div>
      </div>
    </div>
  );
};

export default DayViewHeader;
