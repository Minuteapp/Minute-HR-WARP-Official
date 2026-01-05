import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Target, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  projectName: string;
  description?: string;
  dueDate: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  tags: string[];
  assignedTo: string;
  status: 'offen' | 'in-bearbeitung' | 'wartend' | 'abgeschlossen';
}

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskDetailDialog({ task, open, onClose, onSave }: TaskDetailDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [date, setDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );

  if (!task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave({
        ...editedTask,
        dueDate: date ? format(date, 'dd.MM.yyyy') : editedTask.dueDate
      });
      onClose();
    }
  };

  const statusOptions = [
    { value: 'offen', label: 'Offen' },
    { value: 'in-bearbeitung', label: 'In Bearbeitung' },
    { value: 'wartend', label: 'Wartend' },
    { value: 'abgeschlossen', label: 'Abgeschlossen' }
  ];

  const priorityOptions = [
    { value: 'Hoch', label: 'Hoch' },
    { value: 'Mittel', label: 'Mittel' },
    { value: 'Niedrig', label: 'Niedrig' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Projekt */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{editedTask.projectName}</span>
          </div>

          {/* Titel */}
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              placeholder="Aufgabentitel"
            />
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Beschreibung hinzufügen..."
              rows={4}
            />
          </div>

          {/* Status & Priorität */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) => setEditedTask({ ...editedTask, status: value as Task['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as Task['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fälligkeitsdatum */}
          <div className="space-y-2">
            <Label>Fälligkeitsdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Datum wählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Zugewiesen an */}
          <div className="space-y-2">
            <Label>Zugewiesen an</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {editedTask.assignedTo}
                </AvatarFallback>
              </Avatar>
              <Input
                value={editedTask.assignedTo}
                onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                placeholder="Initialen eingeben"
                className="border-0 px-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {editedTask.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
