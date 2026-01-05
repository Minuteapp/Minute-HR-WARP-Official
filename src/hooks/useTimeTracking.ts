
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useTimeCalculations } from './time-tracking/useTimeCalculations';
import { useTimeActions } from './time-tracking/useTimeActions';
import { TimeEntry } from '@/types/time-tracking.types';
import { toast } from 'sonner';

export const useTimeTracking = () => {
  const authContext = useAuth?.() || null;
  const user = authContext?.user || null;
  
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const queryClient = useQueryClient();

  console.log("=== useTimeTracking Hook Start ===");
  console.log("User:", user?.email || 'Not authenticated');

  // Prüfe Authentifizierung
  if (!user) {
    console.warn('useTimeTracking: No authenticated user found');
    return {
      isTracking: false,
      isPaused: false,
      elapsedTime: 0,
      lastDisplayTime: 0,
      trackingStartTime: null,
      currentActiveEntry: null,
      formatTime: (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      },
      handleTimeAction: () => {
        toast.error('Bitte melden Sie sich an, um die Zeiterfassung zu nutzen.');
      },
      handlePauseResume: () => {},
      handleStop: () => {},
      user: null,
      showTimeEntryDialog: false,
      setShowTimeEntryDialog: () => {},
      dailyWorkHours: 0,
      weeklyWorkHours: 0,
      isLoading: false,
      pausedTime: 0
    };
  }

  const {
    elapsedTime,
    setElapsedTime,
    pausedTime,
    setPausedTime,
    pauseStartTime,
    setPauseStartTime,
    lastDisplayTime,
    setLastDisplayTime,
    formatTime,
    getCurrentPausedTime
  } = useTimeCalculations(isTracking, trackingStartTime, isPaused);

  const { data: currentActiveEntry, isLoading: isLoadingActive, error: activeEntryError } = useQuery({
    queryKey: ['activeTimeEntry', user?.id],
    queryFn: () => timeTrackingService.getActiveTimeEntryForUser(user?.id!),
    refetchOnWindowFocus: true,
    staleTime: 0, // Sofort aktualisieren für Pause-Zustand
    retry: 1,
    enabled: !!user
  });

  const { data: todayEntries = [], isLoading: isLoadingToday, error: todayError } = useQuery({
    queryKey: ['todayTimeEntries'],
    queryFn: timeTrackingService.getTodayTimeEntries,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 Minute
    retry: 1,
    enabled: !!user
  });

  const { data: weekEntries = [], isLoading: isLoadingWeek, error: weekError } = useQuery({
    queryKey: ['weekTimeEntries'],
    queryFn: timeTrackingService.getWeekTimeEntries,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 Minuten
    retry: 1,
    enabled: !!user
  });

  // Error handling
  useEffect(() => {
    if (activeEntryError) {
      console.error('Error loading active time entry:', activeEntryError);
    }
    if (todayError) {
      console.error('Error loading today entries:', todayError);
    }
    if (weekError) {
      console.error('Error loading week entries:', weekError);
    }
  }, [activeEntryError, todayError, weekError]);

  // Verarbeite aktiven Zeiteintrag
  useEffect(() => {
    console.log("Processing active entry:", currentActiveEntry);
    
    if (currentActiveEntry) {
      // Ein Eintrag ist "aktiv" wenn status='active' oder status='paused' und kein end_time
      const status = currentActiveEntry.status as string;
      const isActiveOrPaused = (status === 'active' || status === 'paused') && !currentActiveEntry.end_time;
      const isPausedEntry = status === 'paused';
      
      console.log("Entry status analysis:", { 
        status: currentActiveEntry.status, 
        hasEndTime: !!currentActiveEntry.end_time,
        isActiveOrPaused,
        isPausedEntry,
        pausedWorkSeconds: currentActiveEntry.paused_work_seconds
      });
      
      if (isActiveOrPaused) {
        const startTime = new Date(currentActiveEntry.start_time);
        console.log("✅ Active/Paused tracking detected, setting up state");
        
        // Setze den Tracking-Zustand
        setIsTracking(true);
        setTrackingStartTime(startTime);
        
        // Berechne die aktuelle verstrichene Zeit
        const now = new Date();
        const totalElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const currentPausedTime = currentActiveEntry.break_minutes ? currentActiveEntry.break_minutes * 60 : 0;
        
        setPausedTime(currentPausedTime);
        
        // WICHTIG: Setze isPaused korrekt basierend auf status='paused'
        if (isPausedEntry) {
          console.log("⏸️ Entry is paused based on status='paused'");
          // Bei pausiertem Eintrag: Zeige die gespeicherte Zeit
          const savedElapsedTime = currentActiveEntry.paused_work_seconds || 0;
          setElapsedTime(savedElapsedTime);
          setLastDisplayTime(savedElapsedTime);
          setIsPaused(true);
          setPauseStartTime(new Date()); // Setze eine Pause-Startzeit für die UI
        } else {
          console.log("▶️ Entry is active and running");
          const activeTime = Math.max(0, totalElapsed - currentPausedTime);
          setElapsedTime(activeTime);
          setLastDisplayTime(activeTime);
          setIsPaused(false);
          setPauseStartTime(null);
        }
        
        console.log("▶️ Setting state:", {
          isTracking: true,
          isPaused: isPausedEntry,
          startTime: startTime.toISOString(),
          status: currentActiveEntry.status
        });
      } else {
        console.log("❌ Entry not active/paused, resetting state");
        resetTrackingState();
      }
    } else if (!isLoadingActive) {
      // Nur zurücksetzen wenn das Laden abgeschlossen ist
      console.log("⭕ No active entry found and loading complete");
      resetTrackingState();
    }
  }, [currentActiveEntry?.id, currentActiveEntry?.status, currentActiveEntry?.break_minutes, currentActiveEntry?.paused_work_seconds, isLoadingActive]);

  const resetTrackingState = () => {
    setIsTracking(false);
    setTrackingStartTime(null);
    setIsPaused(false);
    setPauseStartTime(null);
    setPausedTime(0);
    setElapsedTime(0);
    setLastDisplayTime(0);
  };

  // Berechnung der täglichen Arbeitsstunden
  const calculateDailyWorkHours = (): number => {
    if (!todayEntries || todayEntries.length === 0) return 0;
    
    const totalSeconds = todayEntries.reduce((total, entry: TimeEntry) => {
      // Nur abgeschlossene Einträge berücksichtigen für Tagesberechnungen
      if (entry.status !== 'completed' && entry.end_time) {
        return total;
      }
      
      const start = new Date(entry.start_time).getTime();
      let end: number;
      
      if (entry.status === 'active' && !entry.end_time) {
        // Für aktuelle laufende Zeiterfassung: aktuelle Zeit verwenden
        end = new Date().getTime();
      } else if (entry.end_time) {
        // Für abgeschlossene Einträge: End-Zeit verwenden
        end = new Date(entry.end_time).getTime();
      } else {
        // Unvollständige Einträge überspringen
        return total;
      }
      
      const workTime = (end - start) / 1000;
      const breakTime = (entry.break_minutes || 0) * 60;
      const activeTime = Math.max(0, workTime - breakTime);
      
      return total + activeTime;
    }, 0);
    
    // Addiere aktuelle Elapsed Time wenn tracking aktiv ist
    if (isTracking && currentActiveEntry) {
      return (totalSeconds + elapsedTime) / 3600;
    }
    
    return totalSeconds / 3600;
  };

  // Berechnung der wöchentlichen Arbeitsstunden
  const calculateWeeklyWorkHours = (): number => {
    if (!weekEntries || weekEntries.length === 0) return 0;
    
    const totalSeconds = weekEntries.reduce((total, entry: TimeEntry) => {
      // Nur abgeschlossene Einträge berücksichtigen für Wochenberechnungen
      if (entry.status !== 'completed' && entry.end_time) {
        return total;
      }
      
      const start = new Date(entry.start_time).getTime();
      let end: number;
      
      if (entry.status === 'active' && !entry.end_time) {
        // Für aktuelle laufende Zeiterfassung: aktuelle Zeit verwenden
        end = new Date().getTime();
      } else if (entry.end_time) {
        // Für abgeschlossene Einträge: End-Zeit verwenden
        end = new Date(entry.end_time).getTime();
      } else {
        // Unvollständige Einträge überspringen
        return total;
      }
      
      const workTime = (end - start) / 1000;
      const breakTime = (entry.break_minutes || 0) * 60;
      const activeTime = Math.max(0, workTime - breakTime);
      
      return total + activeTime;
    }, 0);
    
    // Addiere aktuelle Elapsed Time wenn tracking aktiv ist
    if (isTracking && currentActiveEntry) {
      return (totalSeconds + elapsedTime) / 3600;
    }
    
    return totalSeconds / 3600;
  };

  const {
    handleTimeAction,
    handlePauseResume,
    handleStop
  } = useTimeActions({
    user,
    currentActiveEntry,
    setIsTracking,
    setTrackingStartTime,
    setElapsedTime,
    setPausedTime,
    setPauseStartTime,
    setIsPaused,
    elapsedTime,
    pausedTime,
    pauseStartTime,
    setLastDisplayTime,
    calculateDailyWorkHours,
    calculateWeeklyWorkHours
  });

  // Debug-Ausgabe für finalen Status
  console.log("=== useTimeTracking Final State ===");
  console.log("isTracking:", isTracking);
  console.log("isPaused:", isPaused);
  console.log("elapsedTime:", elapsedTime);
  console.log("currentActiveEntry:", currentActiveEntry);
  console.log("isLoading:", isLoadingActive);

  return {
    isTracking,
    isPaused,
    elapsedTime,
    lastDisplayTime,
    trackingStartTime,
    currentActiveEntry,
    formatTime,
    handleTimeAction,
    handlePauseResume,
    handleStop,
    user,
    showTimeEntryDialog,
    setShowTimeEntryDialog,
    dailyWorkHours: calculateDailyWorkHours(),
    weeklyWorkHours: calculateWeeklyWorkHours(),
    isLoading: isLoadingActive || isLoadingToday || isLoadingWeek,
    pausedTime,
    getCurrentPausedTime
  };
};
