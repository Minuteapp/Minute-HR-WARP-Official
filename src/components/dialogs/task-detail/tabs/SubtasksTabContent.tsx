
import React from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface SubtasksTabContentProps {
  task: Task;
  newSubtask: string;
  onNewSubtaskChange: (value: string) => void;
  onAddSubtask: () => void;
  onToggleSubtask: (index: number) => void;
  readOnly?: boolean;
}

export const SubtasksTabContent = ({
  task,
  newSubtask,
  onNewSubtaskChange,
  onAddSubtask,
  onToggleSubtask,
  readOnly = false
}: SubtasksTabContentProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !readOnly) {
      onAddSubtask();
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => onNewSubtaskChange(e.target.value)}
            placeholder="Neue Unteraufgabe hinzufügen"
            onKeyDown={handleKeyPress}
          />
          <Button onClick={onAddSubtask} disabled={newSubtask.trim() === ""}>
            <Plus className="h-4 w-4 mr-2" /> Hinzufügen
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {task.subtasks && task.subtasks.length > 0 ? (
          <div className="space-y-2">
            {task.subtasks.map((subtask, index) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 p-2 border rounded-md"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => !readOnly && onToggleSubtask(index)}
                  disabled={readOnly}
                />
                <span className={subtask.completed ? "line-through text-gray-500" : ""}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Keine Unteraufgaben vorhanden
          </div>
        )}
      </div>
    </div>
  );
};
