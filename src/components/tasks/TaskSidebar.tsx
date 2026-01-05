
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUSES } from "@/types/project";
import { Badge } from "@/components/ui/badge";

interface TaskSidebarProps {
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  tags?: string[];
  newTag: string;
  onStatusChange: (value: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived') => void;
  onPriorityChange: (value: 'high' | 'medium' | 'low') => void;
  onDueDateChange: (value: string) => void;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag?: (tag: string) => void;
}

export const TaskSidebar = ({
  status,
  priority,
  dueDate,
  tags = [],
  newTag,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onNewTagChange,
  onAddTag,
  onRemoveTag
}: TaskSidebarProps) => {
  return (
    <div className="w-80 space-y-6 border-l border-gray-200 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Status</h3>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map(statusOption => (
              <SelectItem key={statusOption.id} value={statusOption.name}>
                {statusOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Priorität</h3>
        <Select value={priority} onValueChange={onPriorityChange}>
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

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Fälligkeitsdatum</h3>
        <Input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Tags</h3>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge 
              key={tag}
              variant="secondary" 
              className="flex items-center gap-1 py-1"
            >
              {tag}
              {onRemoveTag && (
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
        <div className="flex gap-2">
          <Input
            placeholder="Neuer Tag"
            value={newTag}
            onChange={(e) => onNewTagChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddTag();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddTag}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
