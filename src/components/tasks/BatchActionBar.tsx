
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Tag, 
  User, 
  Trash2, 
  Archive, 
  AlertTriangle,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTasksStore } from '@/stores/useTasksStore';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/tasks';

interface BatchActionBarProps {
  selectedTaskIds: string[];
  onClearSelection: () => void;
}

export const BatchActionBar = ({ selectedTaskIds, onClearSelection }: BatchActionBarProps) => {
  const { batchUpdateTasks, batchDeleteTasks, batchArchiveTasks } = useTasksStore();
  
  if (selectedTaskIds.length === 0) return null;
  
  const handleStatusChange = async (status: Task['status']) => {
    try {
      await batchUpdateTasks(selectedTaskIds, { status });
      toast.success(`Status für ${selectedTaskIds.length} Aufgabe(n) geändert`);
      onClearSelection();
    } catch (error) {
      console.error('Fehler beim Ändern des Status:', error);
      toast.error('Fehler beim Ändern des Status');
    }
  };
  
  const handlePriorityChange = async (priority: Task['priority']) => {
    try {
      await batchUpdateTasks(selectedTaskIds, { priority });
      toast.success(`Priorität für ${selectedTaskIds.length} Aufgabe(n) geändert`);
      onClearSelection();
    } catch (error) {
      console.error('Fehler beim Ändern der Priorität:', error);
      toast.error('Fehler beim Ändern der Priorität');
    }
  };
  
  const handleArchive = async () => {
    try {
      await batchArchiveTasks(selectedTaskIds);
      toast.success(`${selectedTaskIds.length} Aufgabe(n) archiviert`);
      onClearSelection();
    } catch (error) {
      console.error('Fehler beim Archivieren:', error);
      toast.error('Fehler beim Archivieren der Aufgaben');
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Möchten Sie wirklich ${selectedTaskIds.length} Aufgabe(n) in den Papierkorb verschieben?`)) {
      try {
        await batchDeleteTasks(selectedTaskIds);
        toast.success(`${selectedTaskIds.length} Aufgabe(n) in den Papierkorb verschoben`);
        onClearSelection();
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
        toast.error('Fehler beim Verschieben in den Papierkorb');
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 
                  bg-background border border-accent rounded-lg shadow-lg p-2 
                  flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
      <Badge variant="secondary" className="mr-1">
        {selectedTaskIds.length} ausgewählt
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Status ändern
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>Status wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
              <Circle className="mr-2 h-4 w-4 text-blue-500" />
              <span>Zu erledigen</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              <span>In Bearbeitung</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('review')}>
              <AlertTriangle className="mr-2 h-4 w-4 text-purple-500" />
              <span>Prüfung</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('done')}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              <span>Erledigt</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Priorität
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>Priorität wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
              <span className="text-red-500 mr-2 font-bold">●</span>
              <span>Hoch</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
              <span className="text-yellow-500 mr-2 font-bold">●</span>
              <span>Mittel</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
              <span className="text-green-500 mr-2 font-bold">●</span>
              <span>Niedrig</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={handleArchive}>
        <Archive className="h-4 w-4 mr-1" />
        Archivieren
      </Button>

      <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:bg-red-100 hover:text-red-600">
        <Trash2 className="h-4 w-4 mr-1" />
        Löschen
      </Button>

      <Button variant="ghost" size="icon" onClick={onClearSelection} title="Auswahl aufheben">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
