import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './KanbanColumn';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Target, Folder, Map } from 'lucide-react';

interface KanbanBoardProps {
  tasks: any[];
  selectedProjectId?: string;
  selectedRoadmapId?: string;
  onTaskClick: (task: any) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  onDelete?: (taskId: string) => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: any) {
  return (
    <div className="text-center max-w-md">
      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
    </div>
  );
}

export function KanbanBoard({ tasks, onTaskClick, onTaskStatusChange }: KanbanBoardProps) {
  const columns = [
    { id: 'todo', title: 'Zu erledigen', status: 'todo' },
    { id: 'in-progress', title: 'In Bearbeitung', status: 'in-progress' },
    { id: 'review', title: 'Review', status: 'review' },
    { id: 'done', title: 'Erledigt', status: 'done' }
  ];

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <EmptyState 
          icon={Target}
          title="Keine Aufgaben gefunden"
          description="Erstelle deine erste Aufgabe, um zu beginnen."
          actionText="Neue Aufgabe erstellen"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-4 gap-6 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              tasks={getTasksForColumn(column.status)}
              onTaskClick={onTaskClick}
              status={column.status}
              onStatusChange={onTaskStatusChange}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}