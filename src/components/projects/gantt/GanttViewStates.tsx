
import React from 'react';
import { Loader2, Calendar } from 'lucide-react';

interface LoadingStateProps {
  loading: boolean;
}

export const LoadingState = ({ loading }: LoadingStateProps) => {
  if (!loading) return null;
  
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Projektdaten werden geladen...</span>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  loading: boolean;
  selectedProjectData: any;
}

export const EmptyState = ({ loading, selectedProjectData }: EmptyStateProps) => {
  if (loading || selectedProjectData) return null;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Kein Projekt ausgewählt
      </h3>
      <p className="text-muted-foreground max-w-md">
        Wählen Sie ein Projekt aus der Liste aus, um das Gantt-Chart anzuzeigen.
      </p>
    </div>
  );
};
