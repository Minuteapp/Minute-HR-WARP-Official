import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { DependencyTimeline } from '../DependencyTimeline';
import { AIInsights } from '../AIInsights';
import { ExtendedTask } from '../hooks/useEnhancedTasks';
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Flag,
  User,
  Folder
} from 'lucide-react';

interface TaskDetailsProps {
  task?: ExtendedTask | null;
}

export function TaskDetails({ task }: TaskDetailsProps) {
  if (!task) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Keine Aufgabendetails verfügbar. Erstellen oder wählen Sie eine Aufgabe aus.</p>
      </div>
    );
  }

  const getProgressPercentage = () => {
    if (task.estimatedHours === 0) return 0;
    return Math.min((task.actualHours / task.estimatedHours) * 100, 100);
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'review': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'todo': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Aufgaben-Übersicht</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Priorität:</span>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority === 'urgent' ? 'Dringend' :
                   task.priority === 'high' ? 'Hoch' :
                   task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={getStatusColor(task.status)}>
                  {task.status === 'todo' ? 'Zu erledigen' :
                   task.status === 'in-progress' ? 'In Bearbeitung' :
                   task.status === 'review' ? 'Review' : 'Erledigt'}
                </Badge>
              </div>

              {task.assignee && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Zugewiesen an:</span>
                  <span className="text-sm font-medium">{task.assignee}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Fällig am:</span>
                <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(task.dueDate).toLocaleDateString('de-DE')}
                </span>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Überfällig
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Folder className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Projekt:</span>
                <span className="text-sm font-medium">{task.projectId || 'Nicht zugewiesen'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Risiko:</span>
                <Badge variant={task.riskLevel === 'high' ? 'destructive' : task.riskLevel === 'medium' ? 'default' : 'secondary'}>
                  {task.riskLevel === 'high' ? 'Hoch' : task.riskLevel === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Zeiterfassung</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{task.estimatedHours}h</p>
              <p className="text-sm text-gray-600">Geschätzt</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{task.actualHours}h</p>
              <p className="text-sm text-gray-600">Erfasst</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.max(0, task.estimatedHours - task.actualHours)}h
              </p>
              <p className="text-sm text-gray-600">Verbleibend</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {task.actualHours > task.estimatedHours && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Die erfasste Zeit überschreitet die Schätzung um {task.actualHours - task.estimatedHours} Stunden.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependencies */}
      {(task.dependencies.length > 0 || task.blockedBy.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Abhängigkeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <DependencyTimeline taskId={task.id} />
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <AIInsights task={task} />

      {/* Task Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Erstellt am:</span>
            <span>{new Date(task.createdAt).toLocaleDateString('de-DE')}</span>
          </div>
          <div className="flex justify-between">
            <span>Aufgaben-ID:</span>
            <code className="text-xs bg-gray-100 px-1 rounded">{task.id}</code>
          </div>
          {task.projectId && (
            <div className="flex justify-between">
              <span>Projekt-ID:</span>
              <code className="text-xs bg-gray-100 px-1 rounded">{task.projectId}</code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}