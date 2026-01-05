
import React from 'react';
import { useTaskStatuses } from '@/hooks/tasks/useTaskStatuses';
import { TaskColumnHeader } from '../TaskColumnHeader';

export const KanbanSkeleton = () => {
  const { statuses } = useTaskStatuses();
  
  return (
    <div className="flex gap-4 h-full pb-4 overflow-x-auto">
      {statuses.map((status) => (
        <div 
          key={status.id}
          className="flex-shrink-0 w-80 flex flex-col rounded-lg border bg-gray-50"
        >
          <TaskColumnHeader 
            title={status.label}
            count={0}
            color={status.color}
          />
          
          <div className="flex-1 p-2 overflow-y-auto min-h-[200px]">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-gray-200 h-24 rounded-lg mb-2 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
