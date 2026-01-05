
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineHeaderProps {
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (value: 'day' | 'week' | 'month') => void;
}

export const TimelineHeader = ({ viewMode, onViewModeChange }: TimelineHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-base font-medium">Zeitplan</h3>
      <div className="w-36">
        <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as 'day' | 'week' | 'month')}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Anzeige" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Tag</SelectItem>
            <SelectItem value="week">Woche</SelectItem>
            <SelectItem value="month">Monat</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
