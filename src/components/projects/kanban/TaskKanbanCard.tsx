import { Badge } from '@/components/ui/badge';
import { Clock, Paperclip, Calendar, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanTask } from '@/types/kanban';
import { getAvatarColor, getInitials } from '@/utils/avatarUtils';
import { Button } from '@/components/ui/button';

interface TaskKanbanCardProps {
  task: KanbanTask;
  index: number;
  onClick: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const getPriorityBadge = (priority: string, dueDate?: string) => {
  const isOverdue = dueDate && isPast(new Date(dueDate));
  
  if (isOverdue) {
    return (
      <Badge className="bg-red-500 text-white text-xs gap-1">
        <AlertTriangle className="h-3 w-3" />
        Überfällig
      </Badge>
    );
  }

  switch (priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-700 text-xs hover:bg-red-100">Hoch</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-700 text-xs hover:bg-yellow-100">Mittel</Badge>;
    case 'low':
      return <Badge className="bg-green-100 text-green-700 text-xs hover:bg-green-100">Niedrig</Badge>;
    default:
      return null;
  }
};

export const TaskKanbanCard = ({ task, index, onClick, onSelect, isSelected }: TaskKanbanCardProps) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate));

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 p-3 bg-card rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer ${
            snapshot.isDragging ? 'opacity-90 shadow-lg ring-2 ring-primary/20' : ''
          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
        >
          {/* Header with 3-dot menu */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1" onClick={onClick}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="mt-1 rounded border-muted-foreground/30"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-2">
                  {task.title}
                </h3>
                {task.projectId && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Projekt: {task.projectId}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Priority Badge */}
          <div className="mb-3">
            {getPriorityBadge(task.priority, task.dueDate)}
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {task.timeLogged && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{Math.floor(task.timeLogged / 60)}h</span>
                </div>
              )}
              
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}
            </div>

            {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(task.dueDate), 'dd.MM.yyyy')}</span>
              </div>
            )}
          </div>

          {/* Footer with avatars */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <div className="flex -space-x-1.5">
                {task.assignedTo.slice(0, 3).map((userId, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border-2 border-card ${getAvatarColor(userId)}`}
                  >
                    {getInitials(userId)}
                  </div>
                ))}
                {task.assignedTo.length > 3 && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold bg-muted text-muted-foreground border-2 border-card">
                    +{task.assignedTo.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};