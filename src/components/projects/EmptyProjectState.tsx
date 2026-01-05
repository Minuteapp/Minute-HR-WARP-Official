
import React from 'react';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyProjectStateProps {
  onNewProject: () => void;
  isLoading?: boolean;
}

export const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({ onNewProject, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed rounded-lg">
        <div className="w-12 h-12 mb-4 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="w-48 h-6 mb-2 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-64 h-4 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed rounded-lg">
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10">
        <Folder className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">Keine Projekte gefunden</h3>
      <p className="text-gray-500 mb-4 max-w-sm">
        Sie haben noch keine Projekte erstellt. Legen Sie jetzt Ihr erstes Projekt an, um loszulegen.
      </p>
      <Button onClick={onNewProject}>
        <Plus className="mr-2 h-4 w-4" />
        Neues Projekt erstellen
      </Button>
    </div>
  );
};
