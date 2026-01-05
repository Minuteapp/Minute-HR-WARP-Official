import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckSquare, X } from "lucide-react";
import { useState } from "react";
import { TaskFormData, ProjectFormData } from "@/hooks/projects/types";

interface TasksSectionProps {
  formData: ProjectFormData;
  onChange: (field: string, value: any) => void;
}

export const TasksSection = ({ formData, onChange }: TasksSectionProps) => {
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });

  const addTask = () => {
    if (newTask.title.trim()) {
      const tasks = formData.tasks || [];
      onChange('tasks', [...tasks, { ...newTask, id: Date.now().toString() }]);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
    }
  };

  const removeTask = (index: number) => {
    const tasks = formData.tasks || [];
    const updatedTasks = tasks.filter((_, i) => i !== index);
    onChange('tasks', updatedTasks);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium">Aufgaben</h3>
      </div>

      {/* Existing Tasks */}
      <div className="space-y-3">
        {(formData.tasks || []).map((task: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{task.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTask(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
            <div className="flex gap-4 text-sm">
              {task.assignedTo && (
                <span className="text-blue-600">Zugewiesen: {task.assignedTo}</span>
              )}
              {task.priority && (
                <span className={`font-medium ${
                  task.priority === 'high' ? 'text-red-600' :
                  task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  Priorität: {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </span>
              )}
              {task.dueDate && (
                <span className="text-gray-600">Fällig: {task.dueDate}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Task */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-4">Neue Aufgabe hinzufügen</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title">Aufgabentitel</Label>
            <Input
              id="task-title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Aufgabentitel eingeben"
            />
          </div>
          <div>
            <Label htmlFor="task-description">Beschreibung</Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Aufgabenbeschreibung eingeben"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="task-assigned">Zugewiesen an</Label>
              <Input
                id="task-assigned"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                placeholder="Person auswählen"
              />
            </div>
            <div>
              <Label htmlFor="task-priority">Priorität</Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-due">Fälligkeitsdatum</Label>
              <Input
                id="task-due"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>
          <Button 
            onClick={addTask} 
            disabled={!newTask.title.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aufgabe hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
};
