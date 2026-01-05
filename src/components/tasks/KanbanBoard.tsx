
import { useState } from 'react';
import { Task } from '@/types/tasks';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CheckCircle, Circle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import { useDragAndDrop } from '@/hooks/tasks/useDragAndDrop';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: string) => Promise<boolean>;
  onTaskClick: (task: Task) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  icon: React.ReactNode;
  className?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  onTaskStatusChange,
  onTaskClick 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { localTasks, handleDragEnd } = useDragAndDrop({ tasks, onTaskStatusChange });
  
  // Definiere die Spalten
  const columns: KanbanColumn[] = [
    { 
      id: 'todo', 
      title: 'Zu erledigen', 
      status: 'todo', 
      icon: <Circle className="h-4 w-4 text-blue-500" />,
      className: 'border-l-blue-500'
    },
    { 
      id: 'in-progress', 
      title: 'In Bearbeitung', 
      status: 'in-progress', 
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      className: 'border-l-yellow-500' 
    },
    { 
      id: 'review', 
      title: 'Review', 
      status: 'review', 
      icon: <AlertCircle className="h-4 w-4 text-purple-500" />,
      className: 'border-l-purple-500'
    },
    { 
      id: 'blocked', 
      title: 'Blockiert', 
      status: 'blocked', 
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      className: 'border-l-red-500' 
    },
    { 
      id: 'done', 
      title: 'Erledigt', 
      status: 'done', 
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      className: 'border-l-green-500' 
    }
  ];
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Filtern der Aufgaben nach Status
  const getTasksByStatus = (status: string) => {
    return localTasks.filter(task => task.status === status);
  };
  
  // Priorisierungsfarben
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Format für das Datum
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return format(date, 'dd. MMM', { locale: de });
    } catch (error) {
      console.error('Invalid date:', dateStr);
      return null;
    }
  };

  // Sichere Funktion zum Zählen der abgeschlossenen Unteraufgaben
  const getCompletedSubtasksCount = (task: Task) => {
    if (!task.subtasks || !Array.isArray(task.subtasks)) {
      return '0/0';
    }
    const completedCount = task.subtasks.filter(st => st.completed).length;
    return `${completedCount}/${task.subtasks.length}`;
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4", 
        isDragging ? "cursor-grabbing" : ""
      )}>
        {columns.map(column => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                {column.icon}
                <h3 className="font-medium text-sm">{column.title}</h3>
              </div>
              <div className="bg-gray-100 text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
                {getTasksByStatus(column.status).length}
              </div>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  className={cn(
                    "bg-gray-50 rounded-md p-2 flex-1 min-h-[400px] border-l-4",
                    column.className,
                    snapshot.isDraggingOver && "bg-blue-50/50"
                  )}
                  {...provided.droppableProps}
                >
                  <ScrollArea className="h-[65vh]">
                    <div className="space-y-2 pr-2">
                      {getTasksByStatus(column.status).map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "p-3 mb-2 bg-white rounded-md border border-gray-200 cursor-grab hover:border-gray-300 transition-all",
                                snapshot.isDragging && "shadow-lg border-blue-300 rotate-1",
                                task.completed && "bg-gray-50"
                              )}
                              onClick={() => onTaskClick(task)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className={cn(
                                    "font-medium text-sm",
                                    task.completed && "line-through text-gray-400"
                                  )}>
                                    {task.title}
                                  </h4>
                                  
                                  <div className={cn(
                                    "ml-2 text-xs px-2 py-0.5 rounded-full",
                                    getPriorityColor(task.priority)
                                  )}>
                                    {task.priority === 'high' ? 'Hoch' : 
                                     task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                                  </div>
                                </div>
                                
                                {task.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between text-xs">
                                  {task.dueDate && (
                                    <div className={cn(
                                      "text-gray-600",
                                      isPast(new Date(task.dueDate)) && !task.completed && "text-red-600"
                                    )}>
                                      {formatDate(task.dueDate)}
                                    </div>
                                  )}
                                  
                                  {task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                                    <div className="text-gray-500">
                                      {getCompletedSubtasksCount(task)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
