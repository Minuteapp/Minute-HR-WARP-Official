
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskPriorityProps {
  priority: 'high' | 'medium' | 'low';
  onPriorityChange: (value: 'high' | 'medium' | 'low') => void;
}

export const TaskPriority = ({ priority, onPriorityChange }: TaskPriorityProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Priorität</h3>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          <SelectItem value="low">Niedrig</SelectItem>
          <SelectItem value="medium">Mittel</SelectItem>
          <SelectItem value="high">Hoch</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
