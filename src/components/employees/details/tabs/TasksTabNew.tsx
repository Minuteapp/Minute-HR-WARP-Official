import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks } from '@/hooks/employee-tabs/useTasks';
import { TaskDialog } from '../dialogs/TaskDialog';
import { Plus, Edit, Trash2, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TaskFormData } from '@/lib/validations/priority2Schemas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TasksTabNewProps {
  employeeId: string;
}

export const TasksTabNew = ({ employeeId }: TasksTabNewProps) => {
  const { tasks, statistics, createTask, updateTask, deleteTask, completeTask } = useTasks(employeeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');

  const handleCreateTask = async (data: TaskFormData) => {
    // assigned_to als Array übergeben (DB erwartet uuid[])
    const assignedToArray = data.assigned_to ? [data.assigned_to] : [employeeId];
    
    await createTask({
      title: data.title!,
      description: data.description,
      status: data.status!,
      priority: data.priority!,
      project_id: data.project_id,
      assigned_to: assignedToArray,
      due_date: data.due_date,
      estimated_hours: data.estimated_hours,
      tags: data.tags,
    });
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!selectedTask) return;
    
    // assigned_to als Array übergeben für Update
    const updates: any = { ...data };
    if (data.assigned_to) {
      updates.assigned_to = [data.assigned_to];
    }
    
    await updateTask({
      taskId: selectedTask.id,
      updates,
    });
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete);
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      await completeTask(taskId);
    } else {
      await updateTask({
        taskId,
        updates: { status: 'pending', progress: 0 },
      });
    }
  };

  const handleStartTask = async (taskId: string) => {
    await updateTask({
      taskId,
      updates: { status: 'in_progress' },
    });
  };

  const openEditDialog = (task: any) => {
    setSelectedTask(task);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedTask(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const getFilteredTasks = () => {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    switch (filter) {
      case 'today':
        return tasks.filter(t => t.due_date === today.toISOString().split('T')[0]);
      case 'week':
        return tasks.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate >= today && dueDate <= weekFromNow;
        });
      case 'overdue':
        return tasks.filter(t => {
          if (!t.due_date || t.status === 'completed') return false;
          return new Date(t.due_date) < today;
        });
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'Offen', className: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'In Arbeit', className: 'bg-blue-100 text-blue-800' },
      review: { label: 'Review', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Abgeschlossen', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Abgebrochen', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      low: { label: 'Niedrig', className: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Mittel', className: 'bg-blue-100 text-blue-800' },
      high: { label: 'Hoch', className: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Kritisch', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[priority] || variants.medium;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && selectedTask?.status !== 'completed';
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Play className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Arbeit</p>
              <p className="text-2xl font-bold">{statistics.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">{statistics.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
              <p className="text-2xl font-bold">{statistics.overdue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Alle
          </Button>
          <Button 
            variant={filter === 'today' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('today')}
          >
            Heute
          </Button>
          <Button 
            variant={filter === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('week')}
          >
            Diese Woche
          </Button>
          <Button 
            variant={filter === 'overdue' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('overdue')}
          >
            Überfällig
          </Button>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Aufgabe
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Keine Aufgaben gefunden.</p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => handleToggleComplete(task.id, task.status === 'completed')}
                  className="mt-1"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h4>
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                    {isOverdue(task.due_date) && (
                      <Badge className="bg-red-100 text-red-800">Überfällig</Badge>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.due_date && (
                      <span>📅 {new Date(task.due_date).toLocaleDateString('de-DE')}</span>
                    )}
                    {task.estimated_hours && (
                      <span>⏱️ {task.estimated_hours}h</span>
                    )}
                  </div>

                  {task.progress > 0 && task.status !== 'completed' && (
                    <div className="mt-3">
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStartTask(task.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(task)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setTaskToDelete(task.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreateTask : handleUpdateTask}
        task={selectedTask}
        mode={dialogMode}
        employeeId={employeeId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aufgabe löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
