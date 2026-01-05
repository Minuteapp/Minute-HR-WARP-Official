
import React from 'react';
import { Task } from '@/types/tasks';
import { TaskCard } from '../TaskCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskColumnHeader } from '../TaskColumnHeader';

interface KanbanColumnProps {
  status: {
    id: string;
    name: string;
    label: string;
    color: string;
  };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const KanbanColumn = ({ status, tasks, onTaskClick }: KanbanColumnProps) => {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col rounded-lg border h-full min-h-[500px]">
      <TaskColumnHeader 
        title={status.label}
        count={tasks.length}
        color={status.color}
      />
      
      <Droppable droppableId={status.name}>
        {(provided, snapshot) => (
          <div
            className={`flex-1 p-2 overflow-y-auto min-h-[200px] ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
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
                    className={`mb-2 transition-all ${
                      snapshot.isDragging 
                        ? 'opacity-70 scale-105 shadow-xl z-10' 
                        : 'opacity-100'
                    }`}
                    onClick={() => onTaskClick(task)}
                  >
                    <TaskCard 
                      task={task} 
                      onClick={() => onTaskClick(task)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
