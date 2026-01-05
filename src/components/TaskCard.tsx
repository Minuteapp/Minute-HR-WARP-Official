import React from 'react';
import { useDrag } from 'react-dnd';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Clock, Paperclip, MessageCircle, CheckSquare, Flag, GripVertical, Check, Trash2, RotateCcw } from 'lucide-react';

interface TaskCardProps {
  task: any;
  onClick: () => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onClick, onStatusChange, onDelete }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [task.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return 'Mittel';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      onStatusChange(task.id, newStatus);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Aufgabe wirklich löschen?')) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      ref={drag}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group ${
        isDragging ? 'opacity-50 rotate-3 scale-105 shadow-lg z-50' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Title and Priority */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            <GripVertical className={`h-4 w-4 text-gray-400 mt-0.5 transition-opacity ${
              isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`} />
            <h4 className="font-medium text-gray-900 text-sm leading-5 flex-1">
              {task.title}
            </h4>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {/* Quick Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleStatusToggle}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                  task.status === 'done' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                }`}
                title={task.status === 'done' ? 'Als zu erledigen markieren' : 'Als erledigt markieren'}
              >
                {task.status === 'done' ? (
                  <RotateCcw className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-gray-100 text-red-600 hover:text-red-700 transition-colors"
                title="Aufgabe löschen"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              <Flag className="h-3 w-3 mr-1" />
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
            {task.status === 'todo' ? 'Zu erledigen' :
             task.status === 'in-progress' ? 'In Bearbeitung' :
             task.status === 'review' ? 'Review' :
             'Erledigt'}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Überfällig
            </Badge>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            <Clock className="h-3 w-3 mr-1" />
            {new Date(task.dueDate).toLocaleDateString('de-DE')}
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Time tracking */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {task.actualHours || 0}h / {task.estimatedHours || 0}h
            </div>
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="flex items-center">
                <CheckSquare className="h-3 w-3 mr-1" />
                {task.dependencies.length} Abhängigkeiten
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {task.assignee.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}