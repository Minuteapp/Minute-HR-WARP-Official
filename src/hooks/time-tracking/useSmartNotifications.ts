
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useTimeTracking } from '@/hooks/useTimeTracking';

export const useSmartNotifications = () => {
  const { toast } = useToast();
  const { isTracking, elapsedTime, dailyWorkHours } = useTimeTracking();

  useEffect(() => {
    // Erinnerung bei vergessener Zeiterfassung
    const checkMissingTimeTracking = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Zwischen 9-17 Uhr prüfen
      if (hour >= 9 && hour <= 17 && !isTracking && dailyWorkHours === 0) {
        toast({
          title: "Zeiterfassung vergessen?",
          description: "Sie haben heute noch nicht gestempelt. Möchten Sie jetzt starten?",
        });
      }
    };

    // Warnung bei langer Arbeitszeit
    const checkLongWorkingHours = () => {
      const totalHours = elapsedTime / 3600;
      
      if (totalHours >= 8 && totalHours < 9) {
        toast({
          title: "Normale Arbeitszeit erreicht",
          description: "Sie haben heute bereits 8 Stunden gearbeitet.",
        });
      } else if (totalHours >= 9.5) {
        toast({
          variant: "destructive",
          title: "Lange Arbeitszeit",
          description: "Sie arbeiten bereits sehr lange. Denken Sie an Pausen und Ruhezeiten.",
        });
      }
    };

    // Pausenerinnerung
    const checkBreakReminder = () => {
      const workHours = elapsedTime / 3600;
      
      if (workHours >= 6 && workHours < 6.1) {
        toast({
          title: "Pause empfohlen",
          description: "Nach 6 Stunden Arbeitszeit ist eine Pause gesetzlich vorgeschrieben.",
        });
      }
    };

    // Checks alle 30 Minuten
    const interval = setInterval(() => {
      checkMissingTimeTracking();
      if (isTracking) {
        checkLongWorkingHours();
        checkBreakReminder();
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isTracking, elapsedTime, dailyWorkHours, toast]);

  const showTimeTrackingReminder = () => {
    toast({
      title: "Zeiterfassung nicht vergessen",
      description: "Denken Sie daran, Ihre Arbeitszeit zu erfassen.",
    });
  };

  const showOvertimeWarning = (hours: number) => {
    toast({
      variant: "destructive",
      title: "Überstunden erreicht",
      description: `Sie haben bereits ${hours.toFixed(1)} Überstunden diese Woche.`,
    });
  };

  const showWeekendWorkWarning = () => {
    toast({
      variant: "destructive",
      title: "Wochenendarbeit",
      description: "Arbeiten am Wochenende sollte die Ausnahme bleiben. Achten Sie auf Work-Life-Balance.",
    });
  };

  return {
    showTimeTrackingReminder,
    showOvertimeWarning,
    showWeekendWorkWarning
  };
};
