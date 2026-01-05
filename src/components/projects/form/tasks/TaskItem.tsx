
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, UserPlus, User, X } from "lucide-react";
import { SubtaskInput } from "./SubtaskInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TaskItemProps {
  task: {
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
  };
  teamMembers?: { id: string; name: string; role: string; permissions: string }[];
  taskIndex: number;
  onUpdateTask: (taskIndex: number, field: string, value: any) => void;
  onRemoveTask: (taskIndex: number) => void;
  onAddSubtask: (taskIndex: number, title: string) => void;
  onRemoveSubtask: (taskIndex: number, subtaskIndex: number) => void;
}

export const TaskItem = ({ 
  task, 
  taskIndex, 
  teamMembers = [],
  onUpdateTask, 
  onRemoveTask, 
  onAddSubtask, 
  onRemoveSubtask 
}: TaskItemProps) => {
  const handleAddTeamMember = (memberId: string) => {
    if (task.assignedTo.includes(memberId)) return;
    const updatedAssignedTo = [...task.assignedTo, memberId];
    onUpdateTask(taskIndex, "assignedTo", updatedAssignedTo);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    const updatedAssignedTo = task.assignedTo.filter(id => id !== memberId);
    onUpdateTask(taskIndex, "assignedTo", updatedAssignedTo);
  };

  const getTeamMemberById = (id: string) => {
    return teamMembers.find(member => member.id === id);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const availableTeamMembers = teamMembers.filter(
    member => !task.assignedTo.includes(member.id)
  );

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <Label htmlFor={`task-title-${taskIndex}`}>Aufgabentitel</Label>
          <Input
            id={`task-title-${taskIndex}`}
            value={task.title}
            onChange={(e) => onUpdateTask(taskIndex, "title", e.target.value)}
            placeholder="Aufgabentitel eingeben"
          />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemoveTask(taskIndex)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`task-description-${taskIndex}`}>Beschreibung</Label>
        <Textarea
          id={`task-description-${taskIndex}`}
          value={task.description}
          onChange={(e) => onUpdateTask(taskIndex, "description", e.target.value)}
          placeholder="Beschreibung der Aufgabe"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`task-due-date-${taskIndex}`}>Fälligkeitsdatum</Label>
          <Input
            id={`task-due-date-${taskIndex}`}
            type="date"
            value={task.dueDate}
            onChange={(e) => onUpdateTask(taskIndex, "dueDate", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`task-priority-${taskIndex}`}>Priorität</Label>
          <Select 
            value={task.priority} 
            onValueChange={(value) => onUpdateTask(taskIndex, "priority", value)}
          >
            <SelectTrigger id={`task-priority-${taskIndex}`}>
              <SelectValue placeholder="Priorität auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Verantwortliche Teammitglieder</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {task.assignedTo.length > 0 ? (
            task.assignedTo.map(memberId => {
              const member = getTeamMemberById(memberId);
              return (
                <div 
                  key={memberId} 
                  className="flex items-center bg-gray-100 rounded-full pl-1 pr-2 py-1"
                >
                  <Avatar className="h-6 w-6 mr-1">
                    <AvatarFallback className="text-xs">
                      {member ? getInitials(member.name) : 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm mr-1">
                    {member ? member.name : 'Unbekannt'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 text-gray-500 hover:text-red-500 hover:bg-transparent"
                    onClick={() => handleRemoveTeamMember(memberId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          ) : (
            <span className="text-sm text-gray-500">Keine Teammitglieder zugewiesen</span>
          )}
        </div>
        
        {availableTeamMembers.length > 0 && (
          <Select 
            onValueChange={handleAddTeamMember}
            defaultValue="select-member"
          >
            <SelectTrigger className="w-full md:w-60">
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 mr-2" />
                <span>Teammitglied hinzufügen</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select-member" disabled>Teammitglied auswählen</SelectItem>
              {availableTeamMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {member.name} ({member.role})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Unteraufgaben</Label>
        <SubtaskInput 
          taskIndex={taskIndex} 
          subtasks={task.subtasks} 
          onAddSubtask={onAddSubtask} 
          onRemoveSubtask={onRemoveSubtask} 
        />
      </div>
    </div>
  );
};
