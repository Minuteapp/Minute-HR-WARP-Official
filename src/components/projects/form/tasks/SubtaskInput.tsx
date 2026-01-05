
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SubtaskInputProps {
  taskIndex: number;
  subtasks: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    assignedTo: string[];
    dependsOn?: string[];
  }>;
  onAddSubtask: (taskIndex: number, title: string) => void;
  onRemoveSubtask: (taskIndex: number, subtaskIndex: number) => void;
}

export const SubtaskInput = ({ 
  taskIndex, 
  subtasks, 
  onAddSubtask, 
  onRemoveSubtask 
}: SubtaskInputProps) => {
  const [tempSubtaskTitle, setTempSubtaskTitle] = useState("");

  const handleAddSubtask = () => {
    if (!tempSubtaskTitle.trim()) return;
    onAddSubtask(taskIndex, tempSubtaskTitle);
    setTempSubtaskTitle("");
  };

  return (
    <div className="space-y-2">
      {subtasks && subtasks.length > 0 ? (
        <div className="space-y-2">
          {subtasks.map((subtask, subtaskIndex) => (
            <div key={subtask.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <div className="flex-1 text-sm">{subtask.title}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveSubtask(taskIndex, subtaskIndex)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">Keine Unteraufgaben vorhanden</div>
      )}
      
      <div className="flex gap-2 mt-2">
        <Input
          value={tempSubtaskTitle}
          onChange={(e) => setTempSubtaskTitle(e.target.value)}
          placeholder="Titel der Unteraufgabe"
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddSubtask}
        >
          Hinzufügen
        </Button>
      </div>
    </div>
  );
};
