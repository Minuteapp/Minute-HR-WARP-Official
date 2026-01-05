import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, CheckSquare, Users, Trash2 } from 'lucide-react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskKanbanColumn } from './TaskKanbanColumn';
import { KanbanTask } from '@/types/kanban';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type SwimlaneType = 'team' | 'milestone' | 'risk';
type ColumnId = 'backlog' | 'in_planning' | 'active' | 'review' | 'done';

const columns = [
  { 
    id: 'backlog' as ColumnId, 
    title: 'Backlog', 
    indicator: 'bg-gray-500'
  },
  { 
    id: 'in_planning' as ColumnId, 
    title: 'In Planung', 
    indicator: 'bg-blue-500'
  },
  { 
    id: 'active' as ColumnId, 
    title: 'Aktiv', 
    indicator: 'bg-yellow-500'
  },
  { 
    id: 'review' as ColumnId, 
    title: 'Review', 
    indicator: 'bg-purple-500'
  },
  { 
    id: 'done' as ColumnId, 
    title: 'Erledigt', 
    indicator: 'bg-green-500'
  }
];

export const TaskKanbanBoard = () => {
  const [activeSwimlane, setActiveSwimlane] = useState<SwimlaneType>('team');
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const getTasksForColumn = useCallback((columnId: ColumnId) => {
    let filteredTasks = tasks.filter(task => task.kanban_column === columnId);

    if (activeSwimlane === 'milestone') {
      filteredTasks = filteredTasks.filter(task => task.milestone_id);
    } else if (activeSwimlane === 'risk') {
      filteredTasks = filteredTasks.filter(task => task.risk_level);
    }

    return filteredTasks;
  }, [tasks, activeSwimlane]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }

    const targetColumn = destination.droppableId as ColumnId;
    
    setTasks(prev => 
      prev.map(task => 
        task.id === draggableId 
          ? {...task, kanban_column: targetColumn} 
          : task
      )
    );
    
    toast.success('Aufgabenstatus wurde aktualisiert');
  }, []);

  const handleTaskClick = useCallback((taskId: string) => {
    console.log('Task clicked:', taskId);
  }, []);

  const handleTaskSelect = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const handleBulkStatusChange = useCallback(() => {
    if (selectedTasks.length === 0) {
      toast.error('Keine Aufgaben ausgewählt');
      return;
    }
    toast.success(`Status von ${selectedTasks.length} Aufgaben ändern`);
    setShowBulkActions(false);
  }, [selectedTasks]);

  const handleBulkAssign = useCallback(() => {
    if (selectedTasks.length === 0) {
      toast.error('Keine Aufgaben ausgewählt');
      return;
    }
    toast.success(`${selectedTasks.length} Aufgaben zuweisen`);
    setShowBulkActions(false);
  }, [selectedTasks]);

  const handleBulkDelete = useCallback(() => {
    if (selectedTasks.length === 0) {
      toast.error('Keine Aufgaben ausgewählt');
      return;
    }
    setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    toast.success(`${selectedTasks.length} Aufgaben gelöscht`);
    setSelectedTasks([]);
    setShowBulkActions(false);
  }, [selectedTasks]);

  const swimlaneButtons = [
    { id: 'team' as SwimlaneType, label: 'Team' },
    { id: 'milestone' as SwimlaneType, label: 'Meilenstein' },
    { id: 'risk' as SwimlaneType, label: 'Risiko' },
  ];

  return (
    <div className="space-y-4">
      {/* Swimlane Tabs & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Swimlanes:</span>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {swimlaneButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveSwimlane(btn.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeSwimlane === btn.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {btn.label}
                {activeSwimlane === btn.id && (
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                    Vorschau
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <DropdownMenu open={showBulkActions} onOpenChange={setShowBulkActions}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk-Aktionen
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleBulkStatusChange}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Status ändern
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkAssign}>
                <Users className="h-4 w-4 mr-2" />
                Zuweisen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <TaskKanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksForColumn(column.id)}
              onTaskClick={handleTaskClick}
              onTaskSelect={handleTaskSelect}
              selectedTasks={selectedTasks}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};