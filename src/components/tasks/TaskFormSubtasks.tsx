
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskFormSubtasksProps {
  subtasks: Subtask[];
  newSubtask: string;
  onNewSubtaskChange: (value: string) => void;
  onAddSubtask: () => void;
  onToggleSubtask: (index: number) => void;
  onRemoveSubtask?: (index: number) => void;
  onEditSubtask?: (index: number, title: string) => void;
}

export const TaskFormSubtasks = ({
  subtasks,
  newSubtask,
  onNewSubtaskChange,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onEditSubtask
}: TaskFormSubtasksProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSubtask();
  };

  return (
    <div className="space-y-2">
      <Label>Unteraufgaben</Label>
      
      <div className="space-y-2 mb-3">
        {subtasks.length > 0 ? (
          subtasks.map((subtask, index) => (
            <div key={subtask.id} className="flex items-start space-x-2">
              <Checkbox
                id={`subtask-${subtask.id}`}
                checked={subtask.completed}
                onCheckedChange={() => onToggleSubtask(index)}
                className="mt-1"
              />
              {onEditSubtask ? (
                <Input 
                  value={subtask.title}
                  onChange={(e) => onEditSubtask(index, e.target.value)}
                  className={subtask.completed ? "line-through text-gray-500 flex-1" : "flex-1"}
                />
              ) : (
                <Label
                  htmlFor={`subtask-${subtask.id}`}
                  className={`leading-none pt-1 ${
                    subtask.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {subtask.title}
                </Label>
              )}
              
              {onRemoveSubtask && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => onRemoveSubtask(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">Keine Unteraufgaben hinzugefügt</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          placeholder="Neue Unteraufgabe..."
          value={newSubtask}
          onChange={(e) => onNewSubtaskChange(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!newSubtask.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Hinzufügen
        </Button>
      </form>
    </div>
  );
};
