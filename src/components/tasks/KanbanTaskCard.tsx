import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, MoreVertical, Folder, Calendar } from 'lucide-react';
import { Task } from '@/types/tasks';

interface KanbanTaskCardProps {
  task: Task;
  onClick?: () => void;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getPriorityBorderColor = (priority: string, status: string) => {
  if (status === 'done') return 'border-l-green-500';
  if (priority === 'high') return 'border-l-red-500';
  if (priority === 'medium') return 'border-l-orange-500';
  return 'border-l-green-500';
};

export const KanbanTaskCard = ({ task, onClick }: KanbanTaskCardProps) => {
  const borderColor = getPriorityBorderColor(task.priority, task.status);
  const assignee = task.assignedTo?.[0] || 'Unzugewiesen';

  return (
    <Card 
      className={`bg-white border-l-4 ${borderColor} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Drag Handle + Title + Menu */}
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 cursor-grab" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 -mr-1 -mt-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Project + Date */}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {task.projectId && (
            <div className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              <span>Projekt</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Tags + Assignee */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {task.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div 
            className={`h-6 w-6 rounded-full ${getAvatarColor(assignee)} flex items-center justify-center text-white text-xs font-medium`}
            title={assignee}
          >
            {getInitials(assignee)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
