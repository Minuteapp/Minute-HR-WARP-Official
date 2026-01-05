
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Circle, Clock, User } from 'lucide-react';
import { MeetingFollowUp } from '@/services/smartCalendarService';
import { useUpdateFollowUpStatus } from '@/hooks/useSmartCalendar';

interface FollowUpTasksCardProps {
  tasks: MeetingFollowUp[];
}

const FollowUpTasksCard: React.FC<FollowUpTasksCardProps> = ({ tasks }) => {
  const updateStatus = useUpdateFollowUpStatus();

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateStatus.mutate({ id: taskId, status: newStatus });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine Follow-up-Aufgaben vorhanden</p>
        <p className="text-sm">Aufgaben werden automatisch aus Meetings erstellt</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Meeting Follow-up-Aufgaben</h3>
      
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ausstehend ({pendingTasks.length})</h4>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <Card key={task.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{task.task_title}</p>
                      {task.task_description && (
                        <p className="text-xs text-gray-600 mt-1">{task.task_description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString('de-DE')}
                          </div>
                        )}
                        {task.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            Zugewiesen
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(task.id, 'in_progress')}
                      disabled={updateStatus.isPending}
                    >
                      Starten
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      disabled={updateStatus.isPending}
                    >
                      ✓
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">In Bearbeitung ({inProgressTasks.length})</h4>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <Card key={task.id} className="p-3 border-orange-200 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">{task.task_title}</p>
                      {task.task_description && (
                        <p className="text-xs text-gray-600 mt-1">{task.task_description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(task.id, 'completed')}
                    disabled={updateStatus.isPending}
                  >
                    Abschließen
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Abgeschlossen ({completedTasks.length})</h4>
          <div className="space-y-2">
            {completedTasks.slice(0, 3).map((task) => (
              <Card key={task.id} className="p-3 border-green-200 bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium text-sm line-through">{task.task_title}</p>
                    <p className="text-xs text-gray-600">
                      Abgeschlossen am {new Date().toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {completedTasks.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                ... und {completedTasks.length - 3} weitere abgeschlossene Aufgaben
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpTasksCard;
