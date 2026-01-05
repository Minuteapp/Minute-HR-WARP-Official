
import React from 'react';
import { Task } from '@/types/tasks';
import { TaskCard } from './TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onTaskComplete: (taskId: string, completed: boolean) => void;
  onTaskDelete: (taskId: string) => Promise<boolean>;
  onTaskArchive?: (taskId: string) => Promise<boolean>;
  customActions?: (task: Task) => React.ReactElement;
  selectedTasks?: string[];
  onTaskSelection?: (taskId: string, isSelected: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onTaskComplete,
  onTaskDelete,
  onTaskArchive,
  customActions,
  selectedTasks = [],
  onTaskSelection
}) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h8.25a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Keine Aufgaben gefunden
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Es wurden keine Aufgaben gefunden, die Ihren aktuellen Filterkriterien entsprechen.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-2 p-1">
        {tasks.map((task) => (
          <div key={task.id} className="relative">
            <div className="flex items-center gap-3">
              {onTaskSelection && (
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => onTaskSelection(task.id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              )}
              <div className="flex-1">
                <TaskCard
                  task={task}
                  onClick={() => onTaskClick(task.id)}
                  onComplete={(completed) => onTaskComplete(task.id, completed)}
                  onDelete={() => onTaskDelete(task.id)}
                  onArchive={onTaskArchive ? () => onTaskArchive(task.id) : undefined}
                  showActions={true}
                />
              </div>
            </div>
            {customActions && (
              <div className="absolute top-2 right-2">
                {customActions(task)}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
