
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskTemplatesStore } from '@/stores/useTaskTemplatesStore';
import { useTaskStatuses } from '@/hooks/tasks/useTaskStatuses';
import type { Task } from '@/types/tasks';
import { toast } from "sonner";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function SaveTemplateDialog({ 
  open, 
  onOpenChange,
  task
}: SaveTemplateDialogProps) {
  const { addTemplate } = useTaskTemplatesStore();
  const { statuses } = useTaskStatuses();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [defaultDurationDays, setDefaultDurationDays] = useState(3);
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted'>('todo');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isTeamTemplate, setIsTeamTemplate] = useState(false);
  const [autoTimeTracking, setAutoTimeTracking] = useState(false);
  
  useEffect(() => {
    if (task && open) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      
      // Calculate days until due date if it exists
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDefaultDurationDays(diffDays > 0 ? diffDays : 1);
      }
    }
  }, [task, open]);
  
  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }
    
    addTemplate({
      title,
      description,
      defaultDurationDays,
      status,
      priority,
      isTeamTemplate,
      autoTimeTracking,
      createdBy: 'currentUser', // In a real app, get this from auth context
      subtasks: task?.subtasks,
      tags: task?.tags,
      assignedTo: task?.assignedTo,
      projectId: task?.projectId,
    });
    
    onOpenChange(false);
    
    // Reset form
    setTitle('');
    setDescription('');
    setDefaultDurationDays(3);
    setStatus('todo');
    setPriority('medium');
    setIsTeamTemplate(false);
    setAutoTimeTracking(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Als Vorlage speichern</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-title">Vorlagenname</Label>
            <Input
              id="template-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Design-Review"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-description">Beschreibung</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie den Zweck dieser Vorlage"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-duration">Standarddauer (Tage)</Label>
              <Input
                id="template-duration"
                type="number"
                min={1}
                value={defaultDurationDays}
                onChange={(e) => setDefaultDurationDays(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-priority">Priorität</Label>
              <Select 
                value={priority} 
                onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}
              >
                <SelectTrigger id="template-priority">
                  <SelectValue placeholder="Priorität wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-status">Status bei Erstellung</Label>
            <Select 
              value={status} 
              onValueChange={(value: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done' | 'archived' | 'deleted') => setStatus(value)}
            >
              <SelectTrigger id="template-status">
                <SelectValue placeholder="Status wählen" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(statusOption => (
                  <SelectItem key={statusOption.id} value={statusOption.name}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="team-template" 
                checked={isTeamTemplate} 
                onCheckedChange={(checked) => setIsTeamTemplate(checked as boolean)}
              />
              <Label 
                htmlFor="team-template" 
                className="text-sm font-normal cursor-pointer"
              >
                Als Team-Vorlage freigeben (für alle Benutzer sichtbar)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="auto-time-tracking" 
                checked={autoTimeTracking} 
                onCheckedChange={(checked) => setAutoTimeTracking(checked as boolean)}
              />
              <Label 
                htmlFor="auto-time-tracking" 
                className="text-sm font-normal cursor-pointer"
              >
                Automatische Zeiterfassung bei Aufgabenstart
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>
            Vorlage speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hinweis an den Benutzer: Diese Datei ist ziemlich lang (212 Zeilen) und sollte in Zukunft refaktorisiert werden.
