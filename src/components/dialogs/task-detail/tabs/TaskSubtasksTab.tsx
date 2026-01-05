import React from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckSquare } from "lucide-react";

interface TaskSubtasksTabProps {
  task: Task;
  newSubtask: string;
  setNewSubtask: (value: string) => void;
  handleAddSubtask: () => void;
  handleToggleSubtask: (subtaskId: string) => void;
  readOnly?: boolean;
}

export const TaskSubtasksTab = ({ 
  task, 
  newSubtask, 
  setNewSubtask, 
  handleAddSubtask, 
  handleToggleSubtask, 
  readOnly = false 
}: TaskSubtasksTabProps) => {
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];

  return (
    <div className="p-6">
      {/* Header mit Icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <CheckSquare className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <p className="text-sm text-gray-600">Unteraufgaben-Verwaltung</p>
        </div>
      </div>

      {/* Subtasks Liste */}
      <div className="space-y-4">
        {subtasks.length > 0 ? (
          subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => handleToggleSubtask(subtask.id)}
                disabled={readOnly}
              />
              <div className="flex-1">
                <div className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                  {subtask.title}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Keine Unteraufgaben verfügbar</h3>
            <p className="text-gray-600 mb-4">
              Für diese Aufgabe wurden noch keine Unteraufgaben definiert.
            </p>
          </div>
        )}
      </div>

      {/* Add Subtask Form */}
      {!readOnly && (
        <div className="mt-6 p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Neue Unteraufgabe hinzufügen..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
            />
            <Button
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-yellow-600 font-medium text-sm">Demo:</div>
          <div className="text-yellow-700 text-sm">
            Unteraufgaben sind nur für die erste Aufgabe verfügbar. In der vollständigen Version können Sie Unteraufgaben für alle Aufgaben verwalten.
          </div>
        </div>
      </div>
    </div>
  );
};