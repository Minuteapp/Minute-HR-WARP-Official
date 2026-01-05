
import { AlertCircle, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { ReactNode } from 'react';

export interface KanbanColumn {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
}

export const useKanbanColumns = () => {
  const columns: KanbanColumn[] = [
    { 
      id: 'planned', 
      title: 'Geplant',
      icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
      color: 'bg-gray-50 border-gray-200'
    },
    { 
      id: 'in_progress', 
      title: 'In Bearbeitung',
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'blocked', 
      title: 'Blockiert',
      icon: <PauseCircle className="h-4 w-4 text-red-500" />,
      color: 'bg-red-50 border-red-200'
    },
    { 
      id: 'completed', 
      title: 'Abgeschlossen',
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      color: 'bg-green-50 border-green-200'
    }
  ];

  return columns;
};
