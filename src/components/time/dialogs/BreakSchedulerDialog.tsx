import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Clock, Play, X } from 'lucide-react';

interface BreakSchedulerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPaused: boolean;
  isScheduledBreak: boolean;
  breakCountdown: number;
  onScheduleBreak: (minutes: number) => void;
  onScheduleBreakUntil: (endTime: Date) => void;
  onCancelScheduledBreak: () => void;
  onResumeEarly: () => void;
}

const BreakSchedulerDialog = ({
  open,
  onOpenChange,
  isPaused,
  isScheduledBreak,
  breakCountdown,
  onScheduleBreak,
  onScheduleBreakUntil,
  onCancelScheduledBreak,
  onResumeEarly
}: BreakSchedulerDialogProps) => {
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [breakUntilTime, setBreakUntilTime] = useState<string>('');

  const quickBreakOptions = [
    { label: '15 Min', minutes: 15 },
    { label: '30 Min', minutes: 30 },
    { label: '45 Min', minutes: 45 },
    { label: '60 Min', minutes: 60 },
  ];

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleQuickBreak = (minutes: number) => {
    onScheduleBreak(minutes);
    onOpenChange(false);
  };

  const handleCustomBreak = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 480) {
      onScheduleBreak(minutes);
      setCustomMinutes('');
      onOpenChange(false);
    }
  };

  const handleBreakUntil = () => {
    if (!breakUntilTime) return;
    
    const [hours, minutes] = breakUntilTime.split(':').map(Number);
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(hours, minutes, 0, 0);
    
    if (endTime <= now) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    onScheduleBreakUntil(endTime);
    setBreakUntilTime('');
    onOpenChange(false);
  };

  const handleResumeEarlyClick = () => {
    onResumeEarly();
    onOpenChange(false);
  };

  const handleCancelClick = () => {
    onCancelScheduledBreak();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-orange-500" />
            Pause planen
          </DialogTitle>
        </DialogHeader>

        {/* Wenn geplante Pause aktiv: Countdown anzeigen */}
        {isScheduledBreak && breakCountdown > 0 ? (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-sm text-orange-700 mb-2">Verbleibende Pausenzeit</p>
              <div className="text-4xl font-bold font-mono text-orange-800">
                {formatCountdown(breakCountdown)}
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Zeiterfassung wird automatisch fortgesetzt
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleResumeEarlyClick}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Play className="h-4 w-4 mr-2" />
                Jetzt fortsetzen
              </Button>
              <Button
                onClick={handleCancelClick}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Schnellauswahl */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Schnellauswahl</Label>
              <div className="grid grid-cols-4 gap-2">
                {quickBreakOptions.map((option) => (
                  <Button
                    key={option.minutes}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickBreak(option.minutes)}
                    className="text-sm hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Individuelle Eingabe */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Individuelle Dauer</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={480}
                  placeholder="Minuten"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCustomBreak}
                  disabled={!customMinutes || parseInt(customMinutes) <= 0}
                  variant="outline"
                  className="hover:bg-orange-50 hover:border-orange-300"
                >
                  Starten
                </Button>
              </div>
            </div>

            {/* Pause bis Uhrzeit */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pause bis...
              </Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={breakUntilTime}
                  onChange={(e) => setBreakUntilTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleBreakUntil}
                  disabled={!breakUntilTime}
                  variant="outline"
                  className="hover:bg-orange-50 hover:border-orange-300"
                >
                  Starten
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Die Zeiterfassung wird automatisch nach Ablauf der Pause fortgesetzt.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BreakSchedulerDialog;
