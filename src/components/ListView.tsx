import React, { useState } from 'react';
import { EmptyState } from './KanbanBoard';
import { Target } from 'lucide-react';

interface ListViewProps {
  tasks: any[];
  selectedProjectId?: string;
  selectedRoadmapId?: string;
  onTaskClick: (task: any) => void;
}

export function ListView({ tasks, onTaskClick }: ListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
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
    <div className="p-6">
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-4 bg-white border rounded-lg hover:shadow-md cursor-pointer"
          >
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}