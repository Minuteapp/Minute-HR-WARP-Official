
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Edit2 } from "lucide-react";
import { useState } from "react";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskSubtasksFormProps {
  subtasks: Subtask[];
  newSubtask: string;
  setNewSubtask: (subtask: string) => void;
  handleAddSubtask: () => void;
  handleRemoveSubtask: (index: number) => void;
  handleEditSubtask: (index: number, title: string) => void;
  handleToggleSubtask: (index: number) => void;
}

export const TaskSubtasksForm = ({
  subtasks,
  newSubtask,
  setNewSubtask,
  handleAddSubtask,
  handleRemoveSubtask,
  handleEditSubtask,
  handleToggleSubtask
}: TaskSubtasksFormProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const startEditing = (index: number, title: string) => {
    setEditingIndex(index);
    setEditTitle(title);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      handleEditSubtask(editingIndex, editTitle);
      setEditingIndex(null);
      setEditTitle('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditTitle('');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Unteraufgaben hinzufügen</Label>
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Neue Unteraufgabe..."
            className="border-[#9b87f5]"
          />
          <Button 
            type="button"
            onClick={handleAddSubtask}
            variant="outline"
            className="border-[#9b87f5]"
            disabled={!newSubtask.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {subtasks.length > 0 && (
        <div className="space-y-2">
          <Label>Unteraufgaben ({subtasks.filter(st => st.completed).length}/{subtasks.length} erledigt)</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {subtasks.map((subtask, index) => (
              <Card key={subtask.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(index)}
                    />
                    
                    {editingIndex === index ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyPress={handleEditKeyPress}
                          onBlur={saveEdit}
                          autoFocus
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <span 
                        className={`flex-1 ${
                          subtask.completed ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {subtask.title}
                      </span>
                    )}
                    
                    <div className="flex gap-1">
                      {editingIndex !== index && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(index, subtask.title)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubtask(index)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
