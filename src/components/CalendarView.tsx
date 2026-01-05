import React from 'react';
import { EmptyState } from './KanbanBoard';
import { Target } from 'lucide-react';

interface CalendarViewProps {
  tasks: any[];
  selectedProjectId?: string;
  selectedRoadmapId?: string;
  onTaskClick: (task: any) => void;
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
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
    <div className="p-6">
      <div className="text-center py-8">
        <p className="text-gray-500">Kalender-Ansicht - in Entwicklung</p>
      </div>
    </div>
  );
}