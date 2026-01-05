
import { useState, useEffect } from 'react';
import { useTimeTracking } from './useTimeTracking';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { TimeEntry } from '@/types/time-tracking.types';
import { useAuth } from '@/contexts/AuthContext';

interface UseAutoTimeTrackingProps {
  taskId?: string;
  taskTitle?: string;
  isEnabled: boolean;
}

export const useAutoTimeTracking = ({ 
  taskId, 
  taskTitle, 
  isEnabled 
}: UseAutoTimeTrackingProps) => {
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  const [autoTrackingStartTime, setAutoTrackingStartTime] = useState<Date | null>(null);
  const [totalTrackedTime, setTotalTrackedTime] = useState(0); // in seconds
  const { toast } = useToast();
  const { user } = useAuth();
  const { isTracking: isNormalTracking, currentActiveEntry } = useTimeTracking();
  const queryClient = useQueryClient();

  console.log('useAutoTimeTracking - Props:', { taskId, taskTitle, isEnabled, isAutoTracking });

  // Lade die bereits erfasste Zeit für diese Aufgabe
  useEffect(() => {
    const loadTrackedTime = async () => {
      if (!taskId || !taskTitle) return;
      
      try {
        console.log('Lade bereits erfasste Zeit für Aufgabe:', taskId);
        
        // Lade alle Zeiteinträge und filtere nach dieser Aufgabe
        const allEntries = await timeTrackingService.getTimeEntries();
        const taskEntries = allEntries.filter((entry: TimeEntry) => 
          entry.note?.includes(`Task-${taskId}`) || 
          entry.project?.includes(taskTitle)
        );
        
        console.log('Gefundene Zeiteinträge für Aufgabe:', taskEntries);
        
        // Berechne Gesamtzeit
        const total = taskEntries.reduce((sum, entry) => {
          if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            return sum + (end.getTime() - start.getTime()) / 1000;
          }
          return sum;
        }, 0);
        
        setTotalTrackedTime(total);
        console.log('Gesamte erfasste Zeit:', total, 'Sekunden');
        
        // Prüfe ob gerade eine Zeiterfassung für diese Aufgabe läuft
        const activeTaskEntry = taskEntries.find((entry: TimeEntry) => 
          entry.status === 'active' && !entry.end_time
        );
        
        if (activeTaskEntry) {
          console.log('Aktive Zeiterfassung für Aufgabe gefunden:', activeTaskEntry);
          setIsAutoTracking(true);
          setAutoTrackingStartTime(new Date(activeTaskEntry.start_time));
        }
        
      } catch (error) {
        console.error('Fehler beim Laden der Zeiteinträge:', error);
      }
    };

    loadTrackedTime();
  }, [taskId, taskTitle]);

  // Überwache normale Zeiterfassung und stoppe Auto-Tracking wenn nötig
  useEffect(() => {
    if (isNormalTracking && isAutoTracking) {
      console.log('Normale Zeiterfassung gestartet - stoppe automatische Zeiterfassung');
      stopAutoTracking();
    }
  }, [isNormalTracking, isAutoTracking]);

  // Automatische Zeiterfassung starten
  const startAutoTracking = async () => {
    if (!taskId || !taskTitle) {
      console.log('Kann nicht starten - fehlende taskId oder taskTitle:', { taskId, taskTitle });
      return;
    }

    // Stoppe normale Zeiterfassung falls aktiv
    if (currentActiveEntry) {
      console.log('Stoppe aktive normale Zeiterfassung vor Auto-Tracking');
      try {
        await timeTrackingService.endTimeTracking(currentActiveEntry.id);
        // Invalidiere Queries damit sich der Status aktualisiert
        queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      } catch (error) {
        console.error('Fehler beim Stoppen der normalen Zeiterfassung:', error);
      }
    }

    try {
      console.log('Starte automatische Zeiterfassung für Aufgabe:', taskTitle);
      
      const startTime = new Date();
      const timeEntry = await timeTrackingService.startTimeTracking({
        user_id: user?.id || crypto.randomUUID(),
        project: taskTitle,
        location: 'office',
        note: `Task-${taskId}: ${taskTitle}`,
        start_time: startTime.toISOString()
      });

      console.log('Auto-Zeiterfassung gestartet, Entry:', timeEntry);

      setIsAutoTracking(true);
      setAutoTrackingStartTime(startTime);

      // Invalidiere alle relevanten Queries
      queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });

      toast({
        title: "Automatische Zeiterfassung gestartet",
        description: `Zeit wird für "${taskTitle}" erfasst`,
      });

      return timeEntry;
    } catch (error) {
      console.error('Fehler beim Starten der automatischen Zeiterfassung:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Automatische Zeiterfassung konnte nicht gestartet werden",
      });
    }
  };

  // Automatische Zeiterfassung stoppen
  const stopAutoTracking = async () => {
    if (!isAutoTracking || !taskId) {
      console.log('Kann nicht stoppen - nicht aktiv oder fehlende taskId:', { isAutoTracking, taskId });
      return;
    }

    try {
      console.log('Stoppe automatische Zeiterfassung für Aufgabe:', taskTitle);
      
      if (!user?.id) {
        console.log('Keine User-ID verfügbar für Auto-Tracking Stop');
        return;
      }
      
      // Finde den aktiven Zeiteintrag für diese Aufgabe
      const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(user.id);
      console.log('Aktiver Eintrag gefunden:', activeEntry);
      
      if (activeEntry && activeEntry.note?.includes(`Task-${taskId}`)) {
        await timeTrackingService.endTimeTracking(activeEntry.id);
        console.log('Auto-Zeiterfassung beendet für Entry:', activeEntry.id);
        
        // Berechne die erfasste Zeit und addiere sie zur Gesamtzeit
        if (autoTrackingStartTime) {
          const endTime = new Date();
          const sessionTime = (endTime.getTime() - autoTrackingStartTime.getTime()) / 1000;
          setTotalTrackedTime(prev => prev + sessionTime);
        }
        
        setIsAutoTracking(false);
        setAutoTrackingStartTime(null);

        // Invalidiere alle relevanten Queries
        queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
        queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
        queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });

        toast({
          title: "Automatische Zeiterfassung beendet",
          description: `Zeit für "${taskTitle}" wurde gespeichert`,
        });
      } else {
        console.log('Kein passender aktiver Eintrag gefunden');
        setIsAutoTracking(false);
        setAutoTrackingStartTime(null);
      }
    } catch (error) {
      console.error('Fehler beim Stoppen der automatischen Zeiterfassung:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Automatische Zeiterfassung konnte nicht beendet werden",
      });
    }
  };

  return {
    isAutoTracking,
    autoTrackingStartTime,
    totalTrackedTime,
    startAutoTracking,
    stopAutoTracking
  };
};
