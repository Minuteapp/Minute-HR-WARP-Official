import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TimeEntry } from '@/types/time-tracking.types';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase, DollarSign, Clock, Edit, Pause } from 'lucide-react';

interface EditActiveTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntry | null;
  elapsedTime: number;
}

const EditActiveTimeEntryDialog = ({ open, onOpenChange, entry, elapsedTime }: EditActiveTimeEntryDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [breakMinutes, setBreakMinutes] = useState<number>(0);

  useEffect(() => {
    if (entry) {
      setProject(entry.project || '');
      setTask(entry.note || '');
      setCostCenter(entry.department || '');
      setBreakMinutes(entry.break_minutes || 0);
    }
  }, [entry]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!entry) return;

    try {
      await timeTrackingService.updateActiveTimeEntry(entry.id, {
        project,
        note: task,
      });

      // Pausenzeit aktualisieren wenn eingegeben
      if (breakMinutes >= 0) {
        await timeTrackingService.updateTimeEntryStatus(
          entry.id, 
          entry.status || 'active', 
          breakMinutes
        );
      }

      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });

      toast({
        title: 'Zeiterfassung aktualisiert',
        description: 'Die Änderungen wurden erfolgreich übernommen.',
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Die Zeiterfassung konnte nicht aktualisiert werden.',
      });
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-5 h-5 text-blue-600" />
            Aktive Zeiterfassung bearbeiten
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Ändern Sie Projekt, Aufgabe oder Kostenstelle während der laufenden Zeiterfassung
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status-Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col gap-2">
              <Badge className="bg-green-500 hover:bg-green-500 text-white w-fit">
                Aktiv erfasst
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4" />
                <span>Verstrichene Zeit: {formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          {/* Projekt */}
          <div className="space-y-2">
            <Label htmlFor="project" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Projekt
            </Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Projekt wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website-redesign">Website Redesign</SelectItem>
                <SelectItem value="mobile-app">Mobile App Development</SelectItem>
                <SelectItem value="backend-api">Backend API</SelectItem>
                <SelectItem value="general">Allgemein</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aufgabe */}
          <div className="space-y-2">
            <Label htmlFor="task" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Aufgabe (optional)
            </Label>
            <Input
              id="task"
              placeholder="z.B. Frontend Development, Code Review..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Vorschläge werden basierend auf dem gewählten Projekt angezeigt
            </p>
          </div>

          {/* Kostenstelle */}
          <div className="space-y-2">
            <Label htmlFor="costCenter" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Kostenstelle (optional)
            </Label>
            <Select value={costCenter} onValueChange={setCostCenter}>
              <SelectTrigger id="costCenter">
                <SelectValue placeholder="Kostenstelle wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Entwicklung</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pause-Eingabe */}
          <div className="space-y-2">
            <Label htmlFor="breakMinutes" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pause (Minuten)
            </Label>
            <Input
              id="breakMinutes"
              type="number"
              min={0}
              max={480}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
              placeholder="z.B. 30"
            />
            <p className="text-xs text-muted-foreground">
              Geben Sie die Gesamtpause in Minuten ein (z.B. 30 für Mittagspause). Diese Zeit wird von der Arbeitszeit abgezogen.
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ Die Änderungen werden sofort auf die laufende Zeiterfassung angewendet. Die bisherige Zeit bleibt erhalten und wird dem neuen Projekt zugeordnet.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} className="bg-[#3B44F6] hover:bg-[#3B44F6]/90">
            Änderungen übernehmen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditActiveTimeEntryDialog;
