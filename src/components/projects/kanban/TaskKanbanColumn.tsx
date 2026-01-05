import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskKanbanCard } from './TaskKanbanCard';
import { KanbanTask } from '@/types/kanban';

interface TaskKanbanColumnProps {
  column: {
    id: string;
    title: string;
    indicator: string;
  };
  tasks: KanbanTask[];
  onTaskClick: (taskId: string) => void;
  onTaskSelect: (taskId: string) => void;
  selectedTasks: string[];
}

export const TaskKanbanColumn = ({
  column,
  tasks,
  onTaskClick,
  onTaskSelect,
  selectedTasks
}: TaskKanbanColumnProps) => {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-muted/30 rounded-lg border min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.indicator}`} />
          <h3 className="font-medium text-sm">{column.title}</h3>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="p-2 border-b bg-card">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aufgabe hinzufügen
        </Button>
      </div>

      {/* Tasks List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskKanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task.id)}
                onSelect={() => onTaskSelect(task.id)}
                isSelected={selectedTasks.includes(task.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};