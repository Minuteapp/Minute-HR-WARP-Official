import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Sparkles, 
  Plus, 
  Calendar,
  FolderOpen,
  MoreVertical,
  Trash2,
  Edit,
  GripVertical,
  Paperclip,
  Clock,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskDetailViewDialog } from '../TaskDetailViewDialog';
import { Task as StoreTask } from '@/types/tasks';
import { useTasksStore } from '@/stores/useTasksStore';
import { useCompanyId } from '@/hooks/useCompanyId';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  projectName: string;
  dueDate: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  tags: string[];
  assignedTo: string;
  initials: string;
  status: 'offen' | 'in-bearbeitung' | 'wartend' | 'abgeschlossen';
  hasAttachments?: boolean;
  estimatedTime?: string;
}

// Status-Mapping von DB zu UI
const mapDbStatusToUi = (dbStatus: string): Task['status'] => {
  switch (dbStatus) {
    case 'todo':
      return 'offen';
    case 'in-progress':
      return 'in-bearbeitung';
    case 'review':
      return 'wartend';
    case 'done':
      return 'abgeschlossen';
    default:
      return 'offen';
  }
};

// Status-Mapping von UI zu DB
const mapUiStatusToDb = (uiStatus: Task['status']): string => {
  switch (uiStatus) {
    case 'offen':
      return 'todo';
    case 'in-bearbeitung':
      return 'in-progress';
    case 'wartend':
      return 'review';
    case 'abgeschlossen':
      return 'done';
    default:
      return 'todo';
  }
};

// Priority-Mapping von DB zu UI
const mapDbPriorityToUi = (dbPriority: string): Task['priority'] => {
  switch (dbPriority) {
    case 'high':
      return 'Hoch';
    case 'medium':
      return 'Mittel';
    case 'low':
      return 'Niedrig';
    default:
      return 'Mittel';
  }
};

// Initialen aus Name generieren
const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function KanbanBoardTab() {
  const { tasks: storeTasks, fetchTasks, updateTask } = useTasksStore();
  const companyId = useCompanyId();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Lade Aufgaben beim Mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Transformiere Store-Tasks zu Kanban-Tasks
  const tasks = useMemo<Task[]>(() => {
    return storeTasks.map((storeTask) => ({
      id: storeTask.id,
      title: storeTask.title,
      projectName: storeTask.projectId || 'Kein Projekt',
      dueDate: storeTask.dueDate 
        ? new Date(storeTask.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Kein Datum',
      priority: mapDbPriorityToUi(storeTask.priority),
      tags: storeTask.tags || [],
      assignedTo: storeTask.assignedTo?.[0] || '',
      initials: getInitials(storeTask.assignedTo?.[0] || ''),
      status: mapDbStatusToUi(storeTask.status),
      hasAttachments: false,
      estimatedTime: undefined,
    }));
  }, [storeTasks]);

  const columns = [
    { id: 'offen', title: 'Offen', borderColor: 'border-l-red-500' },
    { id: 'in-bearbeitung', title: 'In Bearbeitung', borderColor: 'border-l-blue-500' },
    { id: 'wartend', title: 'Wartend', borderColor: 'border-l-orange-500' },
    { id: 'abgeschlossen', title: 'Abgeschlossen', borderColor: 'border-l-green-500' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleRunAIAnalysis = async () => {
    if (!companyId) {
      toast.error('Keine Firma ausgewählt');
      return;
    }

    if (storeTasks.length === 0) {
      toast.info('Keine Aufgaben vorhanden für die Analyse');
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('kanban-ai-analysis', {
        body: { companyId }
      });

      if (error) throw error;

      setAiAnalysis(data?.analysis || 'Keine Analyse verfügbar');
      toast.success('KI-Analyse abgeschlossen');
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast.error('Fehler bei der KI-Analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Map Kanban Task to Store Task format for dialog
  const mapToStoreTask = (task: Task | null): StoreTask | null => {
    if (!task) return null;
    return {
      id: task.id,
      title: task.title,
      description: '',
      status: task.status === 'offen' ? 'todo' : task.status === 'in-bearbeitung' ? 'in-progress' : task.status === 'abgeschlossen' ? 'done' : 'todo',
      priority: task.priority === 'Hoch' ? 'high' : task.priority === 'Mittel' ? 'medium' : 'low',
      dueDate: task.dueDate,
      progress: task.status === 'abgeschlossen' ? 100 : 50,
      projectId: '',
      assignedTo: [task.assignedTo],
      tags: task.tags,
      completed: task.status === 'abgeschlossen',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleTaskSave = async (updatedTask: Task) => {
    // Aktualisiere im Store mit DB-Status
    const dbStatus = mapUiStatusToDb(updatedTask.status);
    await updateTask(updatedTask.id, { status: dbStatus as StoreTask['status'] });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      return;
    }

    const newUiStatus = destination.droppableId as Task['status'];
    const newDbStatus = mapUiStatusToDb(newUiStatus);
    
    // Aktualisiere den Status in der Datenbank über den Store
    await updateTask(draggableId, { status: newDbStatus as StoreTask['status'] });
  };

  const getPriorityBorderColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Hoch': 'border-l-red-500',
      'Mittel': 'border-l-orange-500',
      'Niedrig': 'border-l-green-500'
    };
    return colors[priority] || 'border-l-gray-500';
  };

  const getTagStyle = (tag: string) => {
    const styles: Record<string, string> = {
      'Recht': 'bg-purple-100 text-purple-700',
      'Dringend': 'bg-red-100 text-red-700',
      'HR': 'bg-blue-100 text-blue-700',
      '1-on-1': 'bg-green-100 text-green-700',
      'Team': 'bg-cyan-100 text-cyan-700',
      'Performance': 'bg-purple-100 text-purple-700',
      'Analyse': 'bg-orange-100 text-orange-700',
      'Dokumentation': 'bg-gray-100 text-gray-700',
      'Finanzen': 'bg-green-100 text-green-700',
      'Review': 'bg-blue-100 text-blue-700',
      'Recruiting': 'bg-purple-100 text-purple-700'
    };
    return styles[tag] || 'bg-gray-100 text-gray-700';
  };

  const getInitialsColor = (initials: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-300',
      'bg-purple-100 text-purple-700 border-purple-300',
      'bg-green-100 text-green-700 border-green-300',
      'bg-orange-100 text-orange-700 border-orange-300',
      'bg-pink-100 text-pink-700 border-pink-300',
      'bg-cyan-100 text-cyan-700 border-cyan-300'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Berechne echte Statistiken
  const totalTasks = storeTasks.length;

  return (
    <div className="space-y-6">
      {/* KI Engpassanalyse Box */}
      <Card className="bg-white border">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-violet-700">KI-Engpassanalyse</h3>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse wird durchgeführt...
                </div>
              ) : aiAnalysis ? (
                <p className="text-sm text-violet-600">{aiAnalysis}</p>
              ) : totalTasks === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine Aufgaben vorhanden. Erstellen Sie Aufgaben, um eine KI-Analyse durchzuführen.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {totalTasks} Aufgabe(n) verfügbar.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRunAIAnalysis}
                    className="text-violet-600 border-violet-300 hover:bg-violet-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    KI-Analyse starten
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <span className="text-sm text-muted-foreground">{columnTasks.length}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 min-h-[500px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-muted/30'
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-background border border-border shadow-sm hover:shadow-md transition-all ${
                                snapshot.isDragging ? 'shadow-xl opacity-90' : ''
                              } border-l-4 ${getPriorityBorderColor(task.priority)}`}
                            >
                              <div className="p-3 space-y-2">
                                {/* Header: Drag Handle + Menu */}
                                <div className="flex items-center justify-between">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Bearbeiten
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Löschen
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {/* Project */}
                                <div className="flex items-center gap-1.5">
                                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{task.projectName}</span>
                                </div>

                                {/* Title */}
                                <h4 
                                  className="font-medium text-sm leading-tight cursor-pointer hover:text-primary"
                                  onClick={() => handleTaskClick(task)}
                                >
                                  {task.title}
                                </h4>

                                {/* Due Date + Time/Attachments */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{task.dueDate}</span>
                                  </div>
                                  {task.estimatedTime && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{task.estimatedTime}</span>
                                    </div>
                                  )}
                                  {task.hasAttachments && (
                                    <div className="flex items-center gap-1">
                                      <Paperclip className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map(tag => (
                                    <Badge
                                      key={tag}
                                      className={`${getTagStyle(tag)} border-0 text-xs px-2 py-0`}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Footer: Avatar */}
                                <div className="flex items-center justify-end pt-1">
                                  <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-medium ${getInitialsColor(task.initials)}`}>
                                    {task.initials}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Add Task Button at bottom */}
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Aufgabe hinzufügen
                      </Button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Detail Dialog */}
      <TaskDetailViewDialog
        task={mapToStoreTask(selectedTask)}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
