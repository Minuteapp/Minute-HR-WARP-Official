
import { useToast } from "@/hooks/use-toast";
import { timeTrackingService } from '@/services/timeTrackingService';
import { useQueryClient } from '@tanstack/react-query';
import { TimeEntry } from '@/types/time-tracking.types';
import { invalidateQueries } from './useTimeStart';

interface UseTimePauseResumeProps {
  user: any;
  currentActiveEntry: TimeEntry | null;
  elapsedTime: number;
  pauseStartTime: Date | null;
  setPauseStartTime: (value: Date | null) => void;
  setPausedTime: (value: number) => void;
  setIsPaused: (value: boolean) => void;
  pausedTime: number;
  setLastDisplayTime: (value: number) => void;
}

export const useTimePauseResume = ({
  user,
  currentActiveEntry,
  elapsedTime,
  pauseStartTime,
  setPauseStartTime,
  setPausedTime,
  setIsPaused,
  pausedTime,
  setLastDisplayTime
}: UseTimePauseResumeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePauseResume = async () => {
    console.log("=== PAUSE/RESUME Handler Start ===", {
      currentActiveEntryStatus: currentActiveEntry?.status,
      elapsedTime,
      pausedTime,
      pauseStartTime: pauseStartTime?.toISOString()
    });

    if (!user || !currentActiveEntry) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine aktive Zeiterfassung gefunden.",
      });
      return;
    }

    try {
      const now = new Date();
      
      // Prüfe ob aktuell pausiert basierend auf status='paused'
      const isPausedCurrently = (currentActiveEntry.status as string) === 'paused';
      
      if (!isPausedCurrently) {
        // PAUSIEREN: Zeiterfassung ist aktiv und soll pausiert werden
        console.log(`🛑 Pausiere Zeiterfassung ${currentActiveEntry.id} bei ${elapsedTime} Sekunden`);
        
        // Wichtig: Zuerst den aktuellen Zeitwert für die Anzeige speichern
        console.log("💾 Speichere elapsedTime für Display:", elapsedTime);
        setLastDisplayTime(elapsedTime);
        
        // Status auf 'paused' setzen
        await timeTrackingService.pauseTimeTracking(currentActiveEntry.id, elapsedTime);
        
        // Lokalen Zustand auf pausiert setzen
        setPauseStartTime(now);
        setIsPaused(true);
        
        toast({
          title: "⏸️ Zeiterfassung pausiert",
          description: `Arbeitszeit bei ${Math.floor(elapsedTime / 3600)}:${String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0')} pausiert.`,
        });
        
      } else {
        // FORTSETZEN: Zeiterfassung ist pausiert und soll fortgesetzt werden
        console.log(`▶️ Setze Zeiterfassung fort ${currentActiveEntry.id}`);
        
        let additionalPauseTime = 0;
        
        if (pauseStartTime) {
          // Berechne zusätzliche Pausenzeit seit dem letzten lokalen Pausieren
          additionalPauseTime = Math.floor((now.getTime() - pauseStartTime.getTime()) / 1000);
          console.log(`⏱️ Zusätzliche Pausenzeit: ${additionalPauseTime} Sekunden`);
        }
        
        console.log(`📊 Bisherige Pausenzeit: ${pausedTime} Sekunden`);
        console.log(`📈 Gesamte Pausenzeit: ${pausedTime + additionalPauseTime} Sekunden`);
        
        // Pausenzeit akkumulieren
        const newPausedTime = pausedTime + additionalPauseTime;
        setPausedTime(newPausedTime);
        
        // Status zurück auf 'active' setzen
        const totalBreakMinutes = Math.floor(newPausedTime / 60);
        await timeTrackingService.resumeTimeTracking(currentActiveEntry.id, totalBreakMinutes);
        
        // Lokalen Zustand auf aktiv setzen
        setPauseStartTime(null);
        setIsPaused(false);
        
        toast({
          title: "▶️ Zeiterfassung fortgesetzt",
          description: "Ihre Arbeitszeit läuft wieder.",
        });
      }
      
      // Queries invalidieren und sofort refetchen für Pause-Zustand
      await invalidateQueries(queryClient, user?.id);
      await queryClient.refetchQueries({ queryKey: ['activeTimeEntry', user?.id] });
      
      console.log("✅ Pause/Resume erfolgreich abgeschlossen");
      
    } catch (error: any) {
      console.error('❌ Fehler beim Pausieren/Fortsetzen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Zeiterfassung konnte nicht pausiert/fortgesetzt werden.",
      });
    }
  };

  return { handlePauseResume };
};
