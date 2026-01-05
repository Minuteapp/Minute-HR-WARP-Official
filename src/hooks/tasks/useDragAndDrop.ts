
import React, { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { Task } from '@/types/tasks';

interface UseDragAndDropProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: string) => Promise<boolean>;
}

export const useDragAndDrop = ({ tasks, onTaskStatusChange }: UseDragAndDropProps) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [isDragging, setIsDragging] = useState(false);

  // Update local tasks when tasks prop changes
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId } = result;

    // If dropped outside of any droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const taskId = draggableId;

    // Optimistic update
    setLocalTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as Task['status'] }
          : task
      )
    );

    try {
      const success = await onTaskStatusChange(taskId, newStatus);
      
      if (!success) {
        // Revert optimistic update on failure
        setLocalTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: source.droppableId as Task['status'] }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update on error
      setLocalTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: source.droppableId as Task['status'] }
            : task
        )
      );
    }
  }, [onTaskStatusChange]);

  return {
    localTasks,
    isDragging,
    handleDragEnd
  };
};
