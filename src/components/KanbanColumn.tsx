import React from 'react';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: string;
  title: string;
  tasks: any[];
  onTaskClick: (task: any) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export function KanbanColumn({ title, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg border min-h-0 h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Keine Aufgaben
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}