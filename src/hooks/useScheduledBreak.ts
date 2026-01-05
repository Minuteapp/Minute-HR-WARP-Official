import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseScheduledBreakProps {
  isPaused: boolean;
  onPauseResume: () => void;
}

export const useScheduledBreak = ({ isPaused, onPauseResume }: UseScheduledBreakProps) => {
  const [scheduledBreakEnd, setScheduledBreakEnd] = useState<Date | null>(null);
  const [breakCountdown, setBreakCountdown] = useState<number>(0);
  const [isScheduledBreak, setIsScheduledBreak] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown-Timer
  useEffect(() => {
    if (scheduledBreakEnd && isScheduledBreak) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((scheduledBreakEnd.getTime() - now.getTime()) / 1000));
        
        setBreakCountdown(remaining);
        
        if (remaining <= 0) {
          // Pause beenden und Zeiterfassung fortsetzen
          handleBreakEnd();
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [scheduledBreakEnd, isScheduledBreak]);

  const handleBreakEnd = useCallback(() => {
    // Timer stoppen
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // State zurücksetzen
    setScheduledBreakEnd(null);
    setBreakCountdown(0);
    setIsScheduledBreak(false);
    
    // Zeiterfassung fortsetzen (nur wenn pausiert)
    if (isPaused) {
      onPauseResume();
    }
    
    // Benachrichtigung
    toast.success('Pause beendet', {
      description: 'Die Zeiterfassung wurde automatisch fortgesetzt.'
    });

    // Browser-Notification (wenn erlaubt)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pause beendet', {
        body: 'Die Zeiterfassung wurde automatisch fortgesetzt.',
        icon: '/favicon.ico'
      });
    }
  }, [isPaused, onPauseResume]);

  const handleScheduleBreak = useCallback((minutes: number) => {
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + minutes);
    
    setScheduledBreakEnd(endTime);
    setBreakCountdown(minutes * 60);
    setIsScheduledBreak(true);
    
    // Pause starten wenn noch nicht pausiert
    if (!isPaused) {
      onPauseResume();
    }
    
    toast.info(`Pause für ${minutes} Minuten gestartet`, {
      description: 'Die Zeiterfassung wird automatisch fortgesetzt.'
    });

    // Browser-Notification-Berechtigung anfordern
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isPaused, onPauseResume]);

  const handleScheduleBreakUntil = useCallback((endTime: Date) => {
    const now = new Date();
    const remainingSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000);
    
    if (remainingSeconds <= 0) {
      toast.error('Die gewählte Zeit liegt in der Vergangenheit');
      return;
    }
    
    setScheduledBreakEnd(endTime);
    setBreakCountdown(remainingSeconds);
    setIsScheduledBreak(true);
    
    // Pause starten wenn noch nicht pausiert
    if (!isPaused) {
      onPauseResume();
    }
    
    const timeString = endTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    toast.info(`Pause bis ${timeString}`, {
      description: 'Die Zeiterfassung wird automatisch fortgesetzt.'
    });

    // Browser-Notification-Berechtigung anfordern
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isPaused, onPauseResume]);

  const handleCancelScheduledBreak = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setScheduledBreakEnd(null);
    setBreakCountdown(0);
    setIsScheduledBreak(false);
    
    toast.info('Geplante Pause abgebrochen');
  }, []);

  const handleResumeEarly = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setScheduledBreakEnd(null);
    setBreakCountdown(0);
    setIsScheduledBreak(false);
    
    // Zeiterfassung fortsetzen
    if (isPaused) {
      onPauseResume();
    }
    
    toast.success('Pause vorzeitig beendet');
  }, [isPaused, onPauseResume]);

  return {
    scheduledBreakEnd,
    breakCountdown,
    isScheduledBreak,
    handleScheduleBreak,
    handleScheduleBreakUntil,
    handleCancelScheduledBreak,
    handleResumeEarly
  };
};
