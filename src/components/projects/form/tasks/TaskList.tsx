
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  assignedTo: string[];
  subtasks: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    assignedTo: string[];
    dependsOn?: string[];
  }>;
}

interface TaskListProps {
  tasks: Task[];
  teamMembers?: { id: string; name: string; role: string; permissions: string }[];
  onChange: (field: string, value: any) => void;
}

export const TaskList = ({ tasks, teamMembers = [], onChange }: TaskListProps) => {
  const handleAddTask = () => {
    const newTask = {
      id: uuidv4(),
      title: "",
      description: "",
      dueDate: "",
      priority: "medium" as const,
      assignedTo: [],
      subtasks: []
    };
    
    onChange("tasks", [...(tasks || []), newTask]);
  };
  
  const handleRemoveTask = (taskIndex: number) => {
    const newTasks = [...(tasks || [])];
    newTasks.splice(taskIndex, 1);
    onChange("tasks", newTasks);
  };
  
  const handleUpdateTask = (taskIndex: number, field: string, value: any) => {
    const newTasks = [...(tasks || [])];
    newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
    onChange("tasks", newTasks);
  };
  
  const handleAddSubtask = (taskIndex: number, title: string) => {
    if (!title.trim()) return;
    
    const newTasks = [...(tasks || [])];
    const newSubtask = {
      id: uuidv4(),
      title: title,
      description: "",
      dueDate: "",
      assignedTo: [],
      dependsOn: []
    };
    
    newTasks[taskIndex].subtasks = [...(newTasks[taskIndex].subtasks || []), newSubtask];
    onChange("tasks", newTasks);
  };
  
  const handleRemoveSubtask = (taskIndex: number, subtaskIndex: number) => {
    const newTasks = [...(tasks || [])];
    newTasks[taskIndex].subtasks.splice(subtaskIndex, 1);
    onChange("tasks", newTasks);
  };

  return (
    <div className="space-y-6">
      {(tasks || []).map((task, taskIndex) => (
        <TaskItem
          key={task.id}
          task={task}
          taskIndex={taskIndex}
          teamMembers={teamMembers}
          onUpdateTask={handleUpdateTask}
          onRemoveTask={handleRemoveTask}
          onAddSubtask={handleAddSubtask}
          onRemoveSubtask={handleRemoveSubtask}
        />
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={handleAddTask}
        className="w-full"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Neue Aufgabe hinzufügen
      </Button>
    </div>
  );
};
