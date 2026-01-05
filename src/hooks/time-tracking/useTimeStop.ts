
import { useToast } from "@/hooks/use-toast";
import { timeTrackingService } from '@/services/timeTrackingService';
import { useQueryClient } from '@tanstack/react-query';
import { TimeEntry } from '@/types/time-tracking.types';
import { useTimeRegulations } from './useTimeRegulations';
import { invalidateQueries } from './useTimeStart';

interface UseTimeStopProps {
  user: any;
  currentActiveEntry: TimeEntry | null;
  elapsedTime: number;
  setIsTracking: (value: boolean) => void;
  setTrackingStartTime: (value: Date | null) => void;
  setElapsedTime: (value: number) => void;
  setPausedTime: (value: number) => void;
  setPauseStartTime: (value: Date | null) => void;
  setIsPaused: (value: boolean) => void;
  setLastDisplayTime?: (value: number) => void;
}

export const useTimeStop = ({
  user,
  currentActiveEntry,
  elapsedTime,
  setIsTracking,
  setTrackingStartTime,
  setElapsedTime,
  setPausedTime,
  setPauseStartTime,
  setIsPaused,
  setLastDisplayTime
}: UseTimeStopProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendRestPeriodReminder } = useTimeRegulations();

  const handleStop = async () => {
    console.log('STOP: Time tracking stop requested');
    console.log('STOP: Current active entry:', currentActiveEntry);
    
    if (!user || !currentActiveEntry) {
      console.log('STOP: No user or active entry found');
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine aktive Zeiterfassung gefunden.",
      });
      return;
    }

    try {
      console.log('STOP: Ending time tracking for entry:', currentActiveEntry.id);
      
      await timeTrackingService.stopTimeTracking(currentActiveEntry.id);
      console.log('STOP: Time tracking ended successfully');
      
      // Zustand sofort zurücksetzen
      setIsTracking(false);
      setTrackingStartTime(null);
      setElapsedTime(0);
      if (setLastDisplayTime) setLastDisplayTime(0);
      setPausedTime(0);
      setPauseStartTime(null);
      setIsPaused(false);
      
      console.log('STOP: State reset completed');
      
      // Ruhezeiterinnerung senden
      sendRestPeriodReminder();
      
      toast({
        title: "Zeiterfassung beendet",
        description: "Ihre Arbeitszeit wurde erfolgreich gespeichert.",
      });
      
      // Queries aktualisieren
      await invalidateQueries(queryClient);
      
    } catch (error: any) {
      console.error('STOP: Error ending time tracking:', error);
      
      // Bei Fehler trotzdem den Status zurücksetzen
      setIsTracking(false);
      setTrackingStartTime(null);
      setElapsedTime(0);
      if (setLastDisplayTime) setLastDisplayTime(0);
      setPausedTime(0);
      setPauseStartTime(null);
      setIsPaused(false);
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Zeiterfassung konnte nicht beendet werden.",
      });
      
      // Trotzdem Queries aktualisieren
      await invalidateQueries(queryClient);
    }
  };

  return { handleStop };
};
