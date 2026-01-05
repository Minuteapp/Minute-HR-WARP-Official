import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Coffee, Play, Clock, StopCircle } from 'lucide-react';
import { TimeEntry } from '@/types/time-tracking.types';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import ProjectSelector from './ProjectSelector';
import TaskSelector from './TaskSelector';

interface PlanBreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEntry: TimeEntry;
}

const BREAK_DURATIONS = [
  { value: '15', label: '15 Minuten' },
  { value: '30', label: '30 Minuten' },
  { value: '45', label: '45 Minuten' },
  { value: '60', label: '1 Stunde' },
  { value: '90', label: '1,5 Stunden' },
  { value: '120', label: '2 Stunden' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

const PlanBreakDialog = ({ open, onOpenChange, currentEntry }: PlanBreakDialogProps) => {
  const [breakDuration, setBreakDuration] = useState('60');
  const [customMinutes, setCustomMinutes] = useState('');
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakEndTime, setBreakEndTime] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [nextProject, setNextProject] = useState(currentEntry.project || '');
  const [nextTask, setNextTask] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Timer für aktive Pause
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isBreakActive && breakEndTime) {
      interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((breakEndTime.getTime() - now.getTime()) / 1000));
        setRemainingSeconds(remaining);
        
        if (remaining === 0) {
          handleBreakEnd();
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreakActive, breakEndTime]);

  const getBreakMinutes = (): number => {
    if (breakDuration === 'custom') {
      return parseInt(customMinutes) || 60;
    }
    return parseInt(breakDuration);
  };

  const formatRemainingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartBreak = async () => {
    try {
      const minutes = getBreakMinutes();
      const endTime = new Date(Date.now() + minutes * 60 * 1000);
      
      // Berechne die verstrichene Zeit (ca. - wird beim Resume korrigiert)
      const startTime = new Date(currentEntry.start_time);
      const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
      
      // Pausiere die aktuelle Zeiterfassung
      await timeTrackingService.pauseTimeTracking(currentEntry.id, elapsedSeconds);
      
      setBreakEndTime(endTime);
      setRemainingSeconds(minutes * 60);
      setIsBreakActive(true);
      
      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      
      toast({
        title: "☕ Pause gestartet",
        description: `Pause für ${minutes} Minuten. Endet um ${endTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}.`,
      });
    } catch (error: any) {
      console.error('Fehler beim Starten der Pause:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Pause konnte nicht gestartet werden.",
      });
    }
  };

  const handleBreakEnd = async () => {
    try {
      // Berechne die tatsächliche Pausendauer in Minuten
      const actualBreakMinutes = Math.ceil((getBreakMinutes() * 60 - remainingSeconds) / 60);
      
      // Setze die Zeiterfassung fort
      await timeTrackingService.resumeTimeTracking(currentEntry.id, actualBreakMinutes);
      
      // Aktualisiere Projekt/Aufgabe wenn gewählt
      if (nextProject !== currentEntry.project || nextTask) {
        await timeTrackingService.updateActiveTimeEntry(currentEntry.id, {
          project: nextProject || 'none',
          task: nextTask || undefined,
        });
      }
      
      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      
      toast({
        title: "▶️ Zeiterfassung fortgesetzt",
        description: nextProject ? `Arbeite jetzt an: ${nextProject}` : "Die Zeiterfassung läuft wieder.",
      });
      
      setIsBreakActive(false);
      setBreakEndTime(null);
      setRemainingSeconds(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Fehler beim Beenden der Pause:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Pause konnte nicht beendet werden.",
      });
    }
  };

  const handleCancelBreak = () => {
    setIsBreakActive(false);
    setBreakEndTime(null);
    setRemainingSeconds(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            Pause planen
          </DialogTitle>
          <DialogDescription>
            Plane eine Pause und wähle optional das nächste Projekt aus.
          </DialogDescription>
        </DialogHeader>

        {isBreakActive ? (
          <div className="py-6 space-y-6">
            {/* Countdown Timer */}
            <div className="text-center">
              <div className="text-6xl font-bold text-amber-600 mb-2">
                {formatRemainingTime(remainingSeconds)}
              </div>
              <p className="text-muted-foreground">
                Pause endet um {breakEndTime?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Progress Ring */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-amber-500"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={
                      2 * Math.PI * 56 * (1 - remainingSeconds / (getBreakMinutes() * 60))
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coffee className="h-10 w-10 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Nächstes Projekt anzeigen */}
            {nextProject && (
              <div className="text-center text-sm text-muted-foreground">
                Nach der Pause: <span className="font-medium text-foreground">{nextProject}</span>
                {nextTask && <span> - {nextTask}</span>}
              </div>
            )}

            {/* Aktionen */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleCancelBreak}
                className="gap-2"
              >
                <StopCircle className="h-4 w-4" />
                Pause abbrechen
              </Button>
              <Button
                onClick={handleBreakEnd}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                Pause jetzt beenden
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Pausendauer wählen */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pausendauer
              </Label>
              <RadioGroup
                value={breakDuration}
                onValueChange={setBreakDuration}
                className="grid grid-cols-2 gap-2"
              >
                {BREAK_DURATIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {breakDuration === 'custom' && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min="1"
                    max="480"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Minuten eingeben"
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">Minuten</span>
                </div>
              )}
            </div>

            {/* Nächstes Projekt/Aufgabe */}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground">
                Optional: Nach der Pause weiterarbeiten an...
              </Label>
              
              <ProjectSelector
                project={nextProject}
                onProjectChange={(project) => {
                  setNextProject(project);
                  setNextTask('');
                }}
              />

              <TaskSelector
                value={nextTask}
                projectName={nextProject}
                onChange={setNextTask}
              />
            </div>

            {/* Start Button */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleStartBreak}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <Coffee className="h-4 w-4" />
                Pause starten ({getBreakMinutes()} Min.)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlanBreakDialog;
