
import { Button } from '@/components/ui/button';
import { CalendarViewType } from '@/types/calendar';

interface CalendarViewSelectorProps {
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const CalendarViewSelector = ({ view, onViewChange }: CalendarViewSelectorProps) => {
  const views: { key: CalendarViewType; label: string }[] = [
    { key: 'day', label: 'Tag' },
    { key: 'week', label: 'Woche' },
    { key: 'month', label: 'Monat' },
    { key: 'year', label: 'Jahr' },
  ];

  return (
    <div className="flex items-center border rounded-lg p-1 bg-gray-50">
      {views.map(({ key, label }) => (
        <Button
          key={key}
          variant={view === key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(key)}
          className={`px-3 py-1 text-xs ${
            view === key 
              ? 'bg-[#3B44F6] text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export default CalendarViewSelector;
