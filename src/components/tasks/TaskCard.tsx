
import React from 'react';
import { Task } from '@/types/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  User,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Trash2,
  Route,
  MapPin,
  Target,
  FileText
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onComplete?: (completed: boolean) => void;
  onDelete?: () => void;
  onArchive?: () => void;
  showActions?: boolean;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onComplete,
  onDelete,
  onArchive,
  showActions = false,
  className
}) => {
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) && !task.completed : false;
  const isDueToday = task.dueDate ? isToday(new Date(task.dueDate)) : false;
  const isDueTomorrow = task.dueDate ? isTomorrow(new Date(task.dueDate)) : false;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'review':
        return 'bg-purple-100 text-purple-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Zu erledigen';
      case 'in-progress':
        return 'In Bearbeitung';
      case 'review':
        return 'Review';
      case 'blocked':
        return 'Blockiert';
      case 'done':
        return 'Erledigt';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return priority;
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Heute';
    if (isTomorrow(date)) return 'Morgen';
    return format(date, 'dd. MMM', { locale: de });
  };

  const handleCompleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) {
      // Wenn die Aufgabe als erledigt markiert wird, archiviere sie automatisch
      if (!task.completed) {
        onComplete(true);
        // Kleine Verzögerung für bessere UX, dann archivieren
        setTimeout(() => {
          if (onArchive) {
            onArchive();
          }
        }, 500);
      } else {
        onComplete(false);
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  // Sichere Behandlung der subtasks - stelle sicher, dass es immer ein Array ist
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const attachments = Array.isArray(task.attachments) ? task.attachments : [];
  
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
        task.completed && "bg-gray-50",
        task.priority === 'high' && "border-l-red-500",
        task.priority === 'medium' && "border-l-yellow-500",
        task.priority === 'low' && "border-l-green-500",
        !task.priority && "border-l-gray-300",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Anklickbarer Punkt links oben */}
            <div 
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center mt-0.5",
                task.completed 
                  ? "bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600" 
                  : "border-gray-300 hover:border-green-500 hover:bg-green-50"
              )}
              onClick={handleCompleteClick}
              title={task.completed ? "Als nicht erledigt markieren" : "Als erledigt markieren und archivieren"}
            >
              {task.completed && (
                <CheckCircle className="h-3 w-3 text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-sm leading-tight mb-1",
                task.completed && "line-through text-gray-500"
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getPriorityColor(task.priority))}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", getStatusColor(task.status))}
            >
              {getStatusLabel(task.status)}
            </Badge>

            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue && !task.completed ? "text-red-600" : "text-gray-600",
                isDueToday && !task.completed && "text-orange-600"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {totalSubtasks > 0 && (
              <span className="text-xs text-gray-500">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
            
            {comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageSquare className="h-3 w-3" />
                {comments.length}
              </div>
            )}
            
            {attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Paperclip className="h-3 w-3" />
                {attachments.length}
              </div>
            )}
            
            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignedTo.slice(0, 3).map((userId, index) => (
                  <Avatar key={userId} className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {userId.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignedTo.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{task.assignedTo.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Roadmap Information */}
        {task.roadmap_context && task.roadmap_context.roadmap_title && (
          <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-xs">
              <Route className="h-3 w-3 text-primary" />
              <span className="font-medium text-primary">Roadmap:</span>
              <span className="text-muted-foreground truncate">{task.roadmap_context.roadmap_title}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {task.roadmap_milestone_id && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Meilenstein</span>
                </div>
              )}
              {task.roadmap_goal_id && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>Ziel</span>
                </div>
              )}
              {task.roadmap_project_id && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>Projekt</span>
                </div>
              )}
            </div>
          </div>
        )}

        {task.progress !== undefined && task.progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Fortschritt</span>
              <span className="text-xs text-gray-600">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
