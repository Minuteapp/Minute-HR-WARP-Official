
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Calendar as CalendarIcon } from "lucide-react";
import { Task } from "@/types/tasks";
import { format, isPast } from "date-fns";
import { de } from "date-fns/locale";

interface TaskDetailHeaderProps {
  task: Task;
  onTaskUpdate?: (field: keyof Task, value: any) => void;
  readOnly?: boolean;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({ 
  task, 
  onTaskUpdate,
  readOnly = false 
}) => {
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) && !task.completed : false;
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onTaskUpdate) {
      onTaskUpdate('title', e.target.value);
    }
  };
  
  const handleCompleteToggle = () => {
    if (onTaskUpdate) {
      onTaskUpdate('completed', !task.completed);
      // Auch den Status entsprechend aktualisieren
      onTaskUpdate('status', !task.completed ? 'done' : 'todo');
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-6 h-6 flex-shrink-0"
          onClick={handleCompleteToggle}
          disabled={readOnly}
        >
          {task.completed ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </Button>
        
        <Input
          value={task.title}
          onChange={handleTitleChange}
          className="text-lg font-semibold border-0 p-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none"
          placeholder="Aufgabentitel"
          readOnly={readOnly}
        />
      </div>
      
      {task.dueDate && (
        <div className="ml-9 mt-1 flex items-center text-sm">
          <CalendarIcon className="h-3.5 w-3.5 mr-1 text-gray-500" />
          <span className={isOverdue && !task.completed ? "text-red-600" : "text-gray-500"}>
            Fällig am {format(new Date(task.dueDate), 'EEEE, d. MMMM yyyy', { locale: de })}
            {isOverdue && !task.completed && " (überfällig)"}
          </span>
        </div>
      )}
    </div>
  );
};
