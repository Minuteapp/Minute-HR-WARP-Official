
import { useState, useEffect, useRef } from 'react';

export const useTimeCalculations = (isTracking: boolean, trackingStartTime: Date | null, isPaused: boolean) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);
  const [lastDisplayTime, setLastDisplayTime] = useState(0);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  console.log("=== useTimeCalculations Debug ===", { 
    isTracking, 
    isPaused, 
    trackingStartTime: trackingStartTime?.toISOString(),
    elapsedTime,
    pausedTime,
    lastDisplayTime
  });

  // Haupttimer - läuft NUR wenn aktiv und NICHT pausiert
  useEffect(() => {
    // Vorhandenen Timer immer stoppen
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Timer läuft NUR wenn tracking aktiv ist UND NICHT pausiert
    if (isTracking && trackingStartTime && !isPaused) {
      console.log("🚀 Starting active timer (not paused)");
      
      const updateElapsedTime = () => {
        const now = new Date();
        const totalElapsed = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000);
        const activeTime = Math.max(0, totalElapsed - pausedTime);
        
        console.log("⏱️ Timer tick:", {
          totalElapsed,
          pausedTime,
          activeTime,
          isPaused
        });

        setElapsedTime(activeTime);
        setLastDisplayTime(activeTime);
      };

      // Sofortige Aktualisierung
      updateElapsedTime();
      
      // Dann jede Sekunde aktualisieren
      intervalIdRef.current = setInterval(updateElapsedTime, 1000);
      console.log("✅ Active timer interval started");
      
    } else if (isPaused && trackingStartTime) {
      // Bei Pause: Zeit einfrieren auf dem letzten Display-Wert
      console.log("⏸️ Timer paused - time frozen at:", lastDisplayTime);
      // Wichtig: Timer NICHT aktualisieren bei Pause
      // setElapsedTime(lastDisplayTime); // Entfernt - lass die Zeit eingefroren
      
    } else {
      console.log("⏹️ Timer stopped or not tracking");
      if (!isTracking) {
        // Komplett zurücksetzen wenn nicht tracking
        setElapsedTime(0);
        setLastDisplayTime(0);
        setPausedTime(0);
        setPauseStartTime(null);
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isTracking, trackingStartTime, isPaused, pausedTime]); // lastDisplayTime entfernt aus deps

  // Pause-Logik
  useEffect(() => {
    if (isPaused && !pauseStartTime && isTracking) {
      const now = new Date();
      console.log("⏸️ Pause started at:", now.toISOString());
      setPauseStartTime(now);
    } else if (!isPaused && pauseStartTime && isTracking) {
      const now = new Date();
      const pauseDuration = Math.floor((now.getTime() - pauseStartTime.getTime()) / 1000);
      console.log("▶️ Pause ended, adding duration:", pauseDuration, "seconds");
      setPausedTime(prev => {
        const newTotal = prev + pauseDuration;
        console.log("📊 Total paused time:", newTotal, "seconds");
        return newTotal;
      });
      setPauseStartTime(null);
    }
  }, [isPaused, pauseStartTime, isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };

  // Reset function für komplettes Zurücksetzen
  const resetTimeCalculations = () => {
    console.log("🔄 Resetting all time calculations");
    setElapsedTime(0);
    setPausedTime(0);
    setPauseStartTime(null);
    setLastDisplayTime(0);
    
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  // Hilfsfunktion um die aktuelle effektive Pausenzeit zu berechnen
  const getCurrentPausedTime = () => {
    let currentPausedTime = pausedTime;
    if (isPaused && pauseStartTime) {
      const now = new Date();
      const currentPauseDuration = Math.floor((now.getTime() - pauseStartTime.getTime()) / 1000);
      currentPausedTime += currentPauseDuration;
    }
    return currentPausedTime;
  };

  return {
    elapsedTime,
    setElapsedTime,
    pausedTime,
    setPausedTime,
    pauseStartTime,
    setPauseStartTime,
    lastDisplayTime,
    setLastDisplayTime,
    formatTime,
    resetTimeCalculations,
    getCurrentPausedTime
  };
};
