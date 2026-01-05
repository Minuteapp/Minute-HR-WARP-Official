
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTaskStatuses } from "@/hooks/tasks/useTaskStatuses";
import { cn } from "@/lib/utils";

interface TaskStatusProps {
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted';
  onStatusChange: (value: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted') => void;
  disabled?: boolean;
}

export const TaskStatus = ({ status, onStatusChange, disabled = false }: TaskStatusProps) => {
  const { statuses } = useTaskStatuses();
  
  const getStatusColor = (statusName: string, isSelected: boolean) => {
    const statusColors = {
      'todo': isSelected ? 'bg-gray-100 text-gray-800 border-gray-300' : '',
      'in-progress': isSelected ? 'bg-blue-100 text-blue-800 border-blue-300' : '',
      'review': isSelected ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : '',
      'blocked': isSelected ? 'bg-red-100 text-red-800 border-red-300' : '',
      'done': isSelected ? 'bg-green-100 text-green-800 border-green-300' : '',
      'archived': isSelected ? 'bg-gray-100 text-gray-800 border-gray-300' : '',
      'deleted': isSelected ? 'bg-gray-100 text-gray-800 border-gray-300' : ''
    };
    return statusColors[statusName as keyof typeof statusColors] || '';
  };
  
  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <div className="grid grid-cols-2 gap-2">
        {statuses.filter(s => s.name !== 'deleted').map((statusOption) => (
          <Button
            key={statusOption.id}
            type="button"
            variant={status === statusOption.name ? "default" : "outline"}
            onClick={() => onStatusChange(statusOption.name)}
            disabled={disabled}
            className={cn(
              "text-sm",
              status === statusOption.name 
                ? getStatusColor(statusOption.name, true)
                : "border-[#9b87f5]",
              disabled && "opacity-70 cursor-not-allowed"
            )}
          >
            {statusOption.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
