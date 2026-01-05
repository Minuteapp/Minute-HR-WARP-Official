import React from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { UserSelect } from '../UserSelect';
import { ProjectSelect } from '../ProjectSelect';
import { ExtendedTask } from '../hooks/useEnhancedTasks';
import { Calendar, Flag, User, Folder } from 'lucide-react';

interface TaskBasicsProps {
  task?: ExtendedTask | null;
  onTaskChange?: (taskData: Partial<ExtendedTask>) => void;
}

export function TaskBasics({ task, onTaskChange }: TaskBasicsProps) {
  const handleInputChange = (field: string, value: any) => {
    if (onTaskChange) {
      onTaskChange({ [field]: value });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Titel *
        </Label>
        <Input
          id="title"
          placeholder="Geben Sie einen aussagekräftigen Titel ein..."
          defaultValue={task?.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="text-lg"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Beschreibung
        </Label>
        <Textarea
          id="description"
          placeholder="Detaillierte Beschreibung der Aufgabe..."
          defaultValue={task?.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
        />
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            Priorität
          </Label>
          <Select
            defaultValue={task?.priority || 'medium'}
            onValueChange={(value) => handleInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor('low')}>Niedrig</Badge>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor('medium')}>Mittel</Badge>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor('high')}>Hoch</Badge>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor('urgent')}>Dringend</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Status
          </Label>
          <Select
            defaultValue={task?.status || 'todo'}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Zu erledigen</SelectItem>
              <SelectItem value="in-progress">In Bearbeitung</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Erledigt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignee and Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <User className="h-4 w-4 mr-2" />
            Zugewiesen an
          </Label>
          <UserSelect
            value={task?.assignee ? { id: '1', name: task.assignee } : null}
            onChange={(user) => handleInputChange('assignee', user?.name || '')}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Fälligkeitsdatum
          </Label>
          <Input
            type="date"
            defaultValue={task?.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
          />
        </div>
      </div>

      {/* Project Assignment */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center">
          <Folder className="h-4 w-4 mr-2" />
          Projekt
        </Label>
        <ProjectSelect
          value={task?.projectId || ''}
          onChange={(projectId) => handleInputChange('projectId', projectId)}
        />
      </div>

      {/* Time Estimates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Geschätzte Stunden
          </Label>
          <Input
            type="number"
            placeholder="8"
            defaultValue={task?.estimatedHours}
            onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Erfasste Stunden
          </Label>
          <Input
            type="number"
            placeholder="0"
            defaultValue={task?.actualHours}
            onChange={(e) => handleInputChange('actualHours', parseInt(e.target.value) || 0)}
            disabled={!task} // Only allow editing for existing tasks
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Tags
        </Label>
        <Input
          placeholder="z.B. frontend, api, design (durch Komma getrennt)"
          defaultValue={task?.tags?.join(', ') || ''}
          onChange={(e) => {
            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
            handleInputChange('tags', tags);
          }}
        />
        {task?.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}