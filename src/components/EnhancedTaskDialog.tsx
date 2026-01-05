import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { X, ExternalLink, Trash2, Check, RotateCcw } from 'lucide-react';
import { TaskBasics } from './task-tabs/TaskBasics';
import { TaskDetails } from './task-tabs/TaskDetails';
import { TaskSubtasks } from './task-tabs/TaskSubtasks';
import { TaskAttachments } from './task-tabs/TaskAttachments';
import { ExtendedTask } from './hooks/useEnhancedTasks';

interface EnhancedTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: ExtendedTask | null;
  onSave?: (taskData: Partial<ExtendedTask>) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export function EnhancedTaskDialog({ isOpen, onClose, task, onSave, onDelete, onStatusChange }: EnhancedTaskDialogProps) {
  const [activeTab, setActiveTab] = useState('basics');
  const [taskData, setTaskData] = useState<Partial<ExtendedTask>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleNavigate = (type: 'roadmap' | 'project' | 'task', id: string) => {
    // In a real app, this would navigate to the respective module
    console.log(`Navigate to ${type}:`, id);
  };

  const handleTaskChange = (newData: Partial<ExtendedTask>) => {
    setTaskData(prevData => ({ ...prevData, ...newData }));
  };

  const handleSave = async () => {
    if (!taskData.title?.trim()) {
      alert('Bitte geben Sie einen Titel für die Aufgabe ein.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const finalTaskData: Partial<ExtendedTask> = {
        ...taskData,
        id: task?.id || `task-${Date.now()}`,
        createdAt: task?.createdAt || new Date().toISOString(),
        actualHours: task?.actualHours || 0,
        riskLevel: task?.riskLevel || 'low',
        dependencies: task?.dependencies || [],
        blockedBy: task?.blockedBy || []
      };

      if (onSave) {
        onSave(finalTaskData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Fehler beim Speichern der Aufgabe.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTaskData({});
    setActiveTab('basics');
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete && window.confirm('Aufgabe wirklich löschen?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleStatusToggle = () => {
    if (task && onStatusChange) {
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-[95vw] sm:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {task ? task.title : 'Neue Aufgabe'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Aufgaben-Details und Bearbeitung
          </DialogDescription>
          
          {/* Task Info */}
          {task && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {task.projectId && (
                <span>Projekt: {task.projectId}</span>
              )}
              {task.priority && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority === 'urgent' ? 'Dringend' :
                   task.priority === 'high' ? 'Hoch' :
                   task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </span>
              )}
              {task.status && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  task.status === 'done' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status === 'done' ? 'Erledigt' :
                   task.status === 'in-progress' ? 'In Bearbeitung' :
                   task.status === 'review' ? 'Review' : 'Zu erledigen'}
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basics">Grundlagen</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="subtasks">Unteraufgaben</TabsTrigger>
              <TabsTrigger value="attachments">Anhänge</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-2">
              <TabsContent value="basics" className="mt-0">
                <TaskBasics task={task} onTaskChange={handleTaskChange} />
              </TabsContent>

              <TabsContent value="details" className="mt-0">
                <TaskDetails task={task} />
              </TabsContent>

              <TabsContent value="subtasks" className="mt-0">
                <TaskSubtasks task={task} />
              </TabsContent>

              <TabsContent value="attachments" className="mt-0">
                <TaskAttachments task={task} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            {/* Quick Actions for existing tasks */}
            {task && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStatusToggle}
                  className={task.status === 'done' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                  disabled={isSaving}
                >
                  {task.status === 'done' ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Als zu erledigen markieren
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Als erledigt markieren
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </div>
            )}
            
            {/* Task Info */}
            <div className="flex items-center space-x-2">
              {(task?.assignee || taskData.assignee) && (
                <span className="text-sm text-gray-600">
                  Zugewiesen: {task?.assignee || taskData.assignee}
                </span>
              )}
              {(task?.dueDate || taskData.dueDate) && (
                <span className="text-sm text-gray-600">
                  Fällig: {new Intl.DateTimeFormat('de-DE').format(new Date(task?.dueDate || taskData.dueDate!))}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Speichern...' : task ? 'Änderungen speichern' : 'Aufgabe erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}