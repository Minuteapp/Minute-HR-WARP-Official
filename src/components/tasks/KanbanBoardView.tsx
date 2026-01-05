import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { KanbanTaskCard } from './KanbanTaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskDetailViewDialog } from './TaskDetailViewDialog';
import { useTasksStore } from '@/stores/useTasksStore';
import { Task } from '@/types/tasks';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { toast } from 'sonner';

interface Column {
  id: string;
  title: string;
  status: string;
}

const columns: Column[] = [
  { id: 'open', title: 'Offen', status: 'todo' },
  { id: 'in-progress', title: 'In Bearbeitung', status: 'in-progress' },
  { id: 'waiting', title: 'Wartend', status: 'review' },
  { id: 'completed', title: 'Abgeschlossen', status: 'done' },
];

interface AIAnalysisResult {
  analysis: string;
  bottlenecks: { id: string; title: string; status: string }[];
  recommendations: string[];
  stats?: {
    total: number;
    inProgress: number;
    overdue: number;
    stale: number;
  };
}

export const KanbanBoardView = () => {
  const { tasks: storeTasks, updateTask, fetchTasks } = useTasksStore();
  const companyId = useCompanyId();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createForColumn, setCreateForColumn] = useState<string>('todo');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Lade Aufgaben beim Mounten (werden bereits gefiltert auf eigene Aufgaben)
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const tasks = storeTasks;

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const destinationColumn = columns.find(c => c.id === result.destination?.droppableId);
    
    if (destinationColumn) {
      await updateTask(taskId, { 
        status: destinationColumn.status as Task['status'],
        completed: destinationColumn.status === 'done',
        progress: destinationColumn.status === 'done' ? 100 : undefined
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleAddTask = (status: string) => {
    setCreateForColumn(status);
    setShowCreateTask(true);
  };

  const handleRunAIAnalysis = async () => {
    if (!companyId) {
      toast.error('Keine Firma ausgewählt');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('kanban-ai-analysis', {
        body: { companyId }
      });

      if (error) throw error;

      setAiAnalysis(data);
      toast.success('KI-Analyse abgeschlossen');
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast.error('KI-Analyse fehlgeschlagen');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Berechne Statistiken
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="space-y-4">
      {/* KI-Engpassanalyse */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-600 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-violet-900 text-sm">KI-Engpassanalyse</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRunAIAnalysis}
                  disabled={isAnalyzing}
                  className="bg-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      KI-Analyse starten
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-violet-800 mt-2">
                {aiAnalysis ? (
                  aiAnalysis.analysis
                ) : tasks.length === 0 ? (
                  'Keine Aufgaben vorhanden. Erstellen Sie Aufgaben, um eine KI-Analyse durchzuführen.'
                ) : (
                  `${tasks.length} Aufgaben gefunden, davon ${inProgressCount} in Bearbeitung. Klicken Sie auf "KI-Analyse starten" für detaillierte Empfehlungen.`
                )}
              </p>
              {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
                <ul className="mt-2 text-sm text-violet-700 list-disc list-inside">
                  {aiAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.status);
            
            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{column.title}</h3>
                    <span className="text-xs text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">
                      {columnTasks.length}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleAddTask(column.status)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[400px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="space-y-2">
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'opacity-80' : ''}
                              >
                                <KanbanTaskCard 
                                  task={task} 
                                  onClick={() => handleTaskClick(task)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {/* Add Task Button at Bottom */}
                      <Button
                        variant="outline"
                        className="w-full mt-3 border-dashed text-muted-foreground hover:text-foreground"
                        onClick={() => handleAddTask(column.status)}
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

      {/* Dialogs */}
      <CreateTaskDialog 
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
      />

      <TaskDetailViewDialog
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
        task={selectedTask}
      />
    </div>
  );
};
