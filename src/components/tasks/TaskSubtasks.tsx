
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface TaskSubtasksProps {
  subtasks?: { id: string; title: string; completed: boolean; }[];
  newSubtask: string;
  onNewSubtaskChange: (value: string) => void;
  onAddSubtask: () => void;
  onToggleSubtask: (index: number) => void;
}

export const TaskSubtasks = ({ 
  subtasks = [], 
  newSubtask, 
  onNewSubtaskChange, 
  onAddSubtask,
  onToggleSubtask
}: TaskSubtasksProps) => {
  // Sicherstellen, dass subtasks immer ein Array ist
  const safeSubtasks = Array.isArray(subtasks) ? subtasks : [];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Unteraufgaben</h3>
      <div className="space-y-2">
        {safeSubtasks.map((subtask, index) => (
          <div key={subtask.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => onToggleSubtask(index)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{subtask.title}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Neue Unteraufgabe"
            value={newSubtask}
            onChange={(e) => onNewSubtaskChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddSubtask();
              }
            }}
          />
          <Button size="sm" variant="outline" onClick={onAddSubtask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
