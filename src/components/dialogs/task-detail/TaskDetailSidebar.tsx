
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Calendar, Tag, Users } from "lucide-react";
import { Task } from "@/types/tasks";
import { TaskStatus } from "@/components/tasks/sidebar/TaskStatus";
import { TaskTeamMembers } from "@/components/tasks/sidebar/TaskTeamMembers";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface TaskDetailSidebarProps {
  task: Task;
  onTaskUpdate: (field: keyof Task, value: any) => void;
  newTag: string;
  setNewTag: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  teamMembers: TeamMember[];
  assignedMembers: string[];
  onAddTeamMember: (memberId: string) => void;
  onRemoveTeamMember: (memberId: string) => void;
  getTeamMemberById: (id: string) => TeamMember | null;
  readOnly?: boolean;
}

export const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({
  task,
  onTaskUpdate,
  newTag,
  setNewTag,
  onAddTag,
  onRemoveTag,
  teamMembers,
  assignedMembers,
  onAddTeamMember,
  onRemoveTeamMember,
  getTeamMemberById,
  readOnly = false
}) => {
  
  const handleStatusChange = (newStatus: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted') => {
    onTaskUpdate('status', newStatus);
    
    // Wenn Status auf 'done' gesetzt wird, markiere auch als completed
    if (newStatus === 'done') {
      onTaskUpdate('completed', true);
    } else if (newStatus === 'todo' || newStatus === 'in-progress' || newStatus === 'review' || newStatus === 'blocked') {
      onTaskUpdate('completed', false);
    }
  };

  const handlePriorityChange = (newPriority: 'high' | 'medium' | 'low') => {
    onTaskUpdate('priority', newPriority);
  };

  const handleDueDateChange = (newDueDate: string) => {
    onTaskUpdate('dueDate', newDueDate);
  };

  const handleAddTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      onAddTag();
    }
  };

  const handleTeamMembersChange = (members: string[]) => {
    onTaskUpdate('assignedTo', members);
  };

  return (
    <div className="w-80 space-y-6 border-l border-gray-200 p-4 overflow-y-auto">
      {/* Status */}
      <TaskStatus 
        status={task.status}
        onStatusChange={handleStatusChange}
        disabled={readOnly}
      />

      {/* Priorität */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Priorität</h3>
        <select 
          value={task.priority} 
          onChange={(e) => handlePriorityChange(e.target.value as 'high' | 'medium' | 'low')}
          className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={readOnly}
        >
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </select>
      </div>

      {/* Fälligkeitsdatum */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Calendar className="h-4 w-4 text-[#9b87f5]" />
          Fälligkeitsdatum
        </h3>
        <Input
          type="datetime-local"
          value={task.dueDate || ''}
          onChange={(e) => handleDueDateChange(e.target.value)}
          disabled={readOnly}
        />
      </div>

      {/* Teammitglieder */}
      {!readOnly && (
        <TaskTeamMembers
          members={assignedMembers}
          onMembersChange={handleTeamMembersChange}
        />
      )}

      {/* Zugewiesene Teammitglieder (Read-Only Anzeige) */}
      {(readOnly || assignedMembers.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <Users className="h-4 w-4 text-[#9b87f5]" />
            Zugewiesene Teammitglieder
          </h3>
          <div className="flex flex-wrap gap-2">
            {assignedMembers.length === 0 ? (
              <div className="text-xs text-gray-500">Keine Teammitglieder zugewiesen</div>
            ) : (
              assignedMembers.map(memberId => {
                const member = getTeamMemberById(memberId);
                return (
                  <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                    {member ? member.name : "Unbekannt"}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => onRemoveTeamMember(memberId)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Tag className="h-4 w-4 text-[#9b87f5]" />
          Tags
        </h3>
        <div className="flex flex-wrap gap-1">
          {(task.tags || []).map((tag) => (
            <Badge 
              key={tag}
              variant="secondary" 
              className="flex items-center gap-1 py-1"
            >
              {tag}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        
        {!readOnly && (
          <div className="flex gap-2">
            <Input
              placeholder="Neuer Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleAddTagKeyPress}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAddTag}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Aufgaben-Informationen */}
      <div className="space-y-2 pt-4 border-t">
        <div className="text-xs text-gray-500">
          <div>Erstellt: {task.createdAt ? new Date(task.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}</div>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div>Aktualisiert: {new Date(task.updatedAt).toLocaleDateString('de-DE')}</div>
          )}
          {task.progress !== undefined && (
            <div>Fortschritt: {task.progress}%</div>
          )}
        </div>
      </div>
    </div>
  );
};
