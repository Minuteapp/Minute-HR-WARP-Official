import React from 'react';
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useEnhancedTasks } from './hooks/useEnhancedTasks';
import { Badge } from './ui/badge';

interface DependencyTimelineProps {
  taskId: string;
}

export function DependencyTimeline({ taskId }: DependencyTimelineProps) {
  const { getTaskDependencies, getBlockingTasks, allTasks } = useEnhancedTasks('admin');
  
  const dependencies = getTaskDependencies(taskId);
  const blockingTasks = getBlockingTasks(taskId);
  const currentTask = allTasks.find(t => t.id === taskId);

  if (!currentTask || (dependencies.length === 0 && blockingTasks.length === 0)) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'done';
  };

  return (
    <div className="space-y-4">
      <h4 className="flex items-center text-sm font-medium text-gray-700">
        <Clock className="h-4 w-4 mr-2" />
        Abhängigkeiten & Timeline
      </h4>

      {/* Dependencies (Tasks this one depends on) */}
      {dependencies.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Abhängig von:</p>
          <div className="space-y-2">
            {dependencies.map((dep) => (
              <div key={dep.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{dep.title}</span>
                    {isOverdue(dep.dueDate, dep.status) && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className={getStatusColor(dep.status)}>
                      {dep.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Fällig: {formatDate(dep.dueDate)}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Task */}
      <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-900">{currentTask.title}</span>
            {isOverdue(currentTask.dueDate, currentTask.status) && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className={getStatusColor(currentTask.status)}>
              {currentTask.status}
            </Badge>
            <span className="text-xs text-blue-700">
              Fällig: {formatDate(currentTask.dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Blocking Tasks */}
      {blockingTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Blockiert:</p>
          <div className="space-y-2">
            {blockingTasks.map((blocked) => (
              <div key={blocked.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{blocked.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className={getStatusColor(blocked.status)}>
                      {blocked.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Geplant: {formatDate(blocked.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}