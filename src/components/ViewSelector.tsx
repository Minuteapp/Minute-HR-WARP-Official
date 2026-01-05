import React from 'react';
import { Button } from './ui/button';
import { LayoutGrid, List, Calendar } from 'lucide-react';

interface ViewSelectorProps {
  currentView: 'kanban' | 'list' | 'calendar';
  onViewChange: (view: 'kanban' | 'list' | 'calendar') => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views = [
    { id: 'kanban' as const, label: 'Kanban', icon: LayoutGrid },
    { id: 'list' as const, label: 'Liste', icon: List },
    { id: 'calendar' as const, label: 'Kalender', icon: Calendar },
  ];

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      {views.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentView === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(id)}
          className="rounded-none border-0"
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );
}