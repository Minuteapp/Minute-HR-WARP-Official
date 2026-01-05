import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Users, 
  Flag, 
  Archive, 
  Trash2, 
  CheckCircle,
  Tag
} from 'lucide-react';
import { useTaskBulkOperations } from '@/hooks/tasks/useTaskBulkOperations';

interface TaskBulkActionsProps {
  selectedTasks: string[];
  onSelectionClear: () => void;
}

export const TaskBulkActions: React.FC<TaskBulkActionsProps> = ({
  selectedTasks,
  onSelectionClear
}) => {
  const {
    bulkUpdateStatus,
    bulkAssign,
    bulkSetPriority,
    bulkAddTags,
    bulkArchive,
    bulkDelete
  } = useTaskBulkOperations();

  const handleStatusUpdate = async (status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted') => {
    const success = await bulkUpdateStatus(selectedTasks, status);
    if (success) {
      onSelectionClear();
    }
  };

  const handlePriorityUpdate = async (priority: 'high' | 'medium' | 'low') => {
    const success = await bulkSetPriority(selectedTasks, priority);
    if (success) {
      onSelectionClear();
    }
  };

  const handleArchive = async () => {
    const success = await bulkArchive(selectedTasks);
    if (success) {
      onSelectionClear();
    }
  };

  const handleDelete = async () => {
    const success = await bulkDelete(selectedTasks);
    if (success) {
      onSelectionClear();
    }
  };

  if (selectedTasks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
      <Badge variant="secondary" className="mr-2">
        {selectedTasks.length} ausgewählt
      </Badge>

      {/* Status ändern */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Status
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover border border-border shadow-lg z-50">
          <DropdownMenuLabel>Status ändern</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusUpdate('todo')} className="cursor-pointer">
            Zu erledigen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('in-progress')} className="cursor-pointer">
            In Bearbeitung
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('review')} className="cursor-pointer">
            Review
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('done')} className="cursor-pointer">
            Erledigt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priorität ändern */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Priorität
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover border border-border shadow-lg z-50">
          <DropdownMenuLabel>Priorität setzen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handlePriorityUpdate('low')} className="cursor-pointer">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              Niedrig
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePriorityUpdate('medium')} className="cursor-pointer">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              Mittel
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePriorityUpdate('high')} className="cursor-pointer">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              Hoch
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Aktionen */}
      <div className="flex items-center gap-1 ml-auto">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleArchive}
        >
          <Archive className="h-4 w-4 mr-2" />
          Archivieren
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Löschen
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onSelectionClear}
        >
          Abbrechen
        </Button>
      </div>
    </div>
  );
};