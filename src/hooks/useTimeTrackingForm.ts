
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { timeTrackingService, type NewTimeEntry } from '@/services/timeTrackingService';
import { TimeEntry } from '@/types/time-tracking.types';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Break {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
}

interface UseTimeTrackingFormProps {
  mode: "start" | "end" | "manual";
  existingEntry?: TimeEntry;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useTimeTrackingForm = ({ mode, existingEntry, onSuccess, onClose }: UseTimeTrackingFormProps) => {
  const { toast } = useToast();
  const authContext = useAuth?.() || null;
  const user = authContext?.user || { id: crypto.randomUUID() };
  const navigate = useNavigate();
  const [selectedOfficeName, setSelectedOfficeName] = useState<string | undefined>();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const queryClient = useQueryClient();

  const [formData, setFormDataState] = useState<NewTimeEntry>({
    project: "none",
    location: "office",
    note: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    office_location_id: undefined,
    user_id: user?.id || crypto.randomUUID()
  });

  // Wrapper für setFormData, der sowohl Objekte als auch Funktionen akzeptiert
  const setFormData = (dataOrFn: NewTimeEntry | ((prev: NewTimeEntry) => NewTimeEntry)) => {
    if (typeof dataOrFn === 'function') {
      setFormDataState(dataOrFn);
    } else {
      setFormDataState(dataOrFn);
    }
  };

  const { data: activeEntry } = useQuery({
    queryKey: ['activeTimeEntry', user?.id],
    queryFn: () => timeTrackingService.getActiveTimeEntryForUser(user?.id!),
    refetchInterval: 30000,
    retry: 1,
    retryDelay: 1000,
    enabled: !!user?.id
  });

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        project: existingEntry.project,
        location: existingEntry.location,
        note: existingEntry.note,
        start_time: existingEntry.start_time,
        end_time: existingEntry.end_time || "",
        office_location_id: existingEntry.office_location_id,
        user_id: user.id
      });
    } else {
      setFormData(prev => ({
        ...prev,
        user_id: user.id
      }));
    }
  }, [existingEntry, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    
    // Prüfung auf aktive Zeiterfassung nur bei Start, nicht bei Update
    if (activeEntry && !existingEntry && mode === "start") {
      console.log('Active entry found, aborting new start:', activeEntry);
      toast({
        variant: "destructive",
        title: "Aktive Zeiterfassung",
        description: "Es läuft bereits eine Zeiterfassung. Bitte beenden Sie diese zuerst oder verwenden Sie die Pause-Funktion.",
      });
      // Dialog NICHT schließen, damit Benutzer die aktive Zeiterfassung sehen kann
      return;
    }

    // Benutzer-Authentifizierung prüfen
    if (!user || !user.id || user.id.length < 10) { // Check for proper UUID length
      console.warn('No authenticated user found, redirecting to login');
      toast({
        variant: "destructive",
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um die Zeiterfassung zu nutzen.",
      });
      navigate('/auth/login');
      return;
    }

    try {
      if (mode === "manual" && (!formData.start_time || !formData.end_time)) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Bitte Start- und Endzeit angeben.",
        });
        return;
      }

      // Sicherstellen, dass user_id korrekt gesetzt ist
      const dataToSubmit = {
        ...formData,
        user_id: user.id
      };

      console.log("Submitting time tracking data:", dataToSubmit);

      if (existingEntry) {
        await timeTrackingService.updateTimeEntry(existingEntry.id, dataToSubmit);
        toast({
          title: "Zeiterfassung aktualisiert",
          description: "Die Zeiterfassung wurde erfolgreich aktualisiert.",
        });
      } else if (mode === "manual") {
        await timeTrackingService.createManualTimeEntry({
          start_time: dataToSubmit.start_time,
          end_time: dataToSubmit.end_time || '',
          project: dataToSubmit.project,
          location: dataToSubmit.location,
          note: dataToSubmit.note,
          office_location_id: dataToSubmit.office_location_id,
          user_id: dataToSubmit.user_id
        });
        toast({
          title: "Zeit nachgetragen",
          description: "Die Zeit wurde erfolgreich nachgetragen.",
        });
      } else {
        await timeTrackingService.startTimeTracking({
          project: dataToSubmit.project,
          location: dataToSubmit.location,
          note: dataToSubmit.note,
          office_location_id: dataToSubmit.office_location_id,
          user_id: dataToSubmit.user_id
        });
        toast({
          title: "Zeiterfassung gestartet",
          description: "Ihre Arbeitszeit wird jetzt erfasst.",
        });
      }
      
      // Queries invalidieren
      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Error with time tracking:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Zeiterfassung konnte nicht gespeichert werden.",
      });
    }
  };

  // Break-Berechnungen
  const calculateTotalBreakMinutes = () => {
    return breaks.reduce((total, breakItem) => {
      if (!breakItem.startTime || !breakItem.endTime) return total;
      
      const start = new Date(`2000-01-01T${breakItem.startTime}`);
      const end = new Date(`2000-01-01T${breakItem.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      return total + (diffMinutes > 0 ? diffMinutes : 0);
    }, 0);
  };

  const calculateWorkTime = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    
    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const breakMinutes = calculateTotalBreakMinutes();
    
    return Math.max(0, totalMinutes - breakMinutes);
  };

  const formatMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return {
    formData,
    setFormData,
    selectedOfficeName,
    setSelectedOfficeName,
    handleSubmit,
    breaks,
    setBreaks,
    calculateTotalBreakMinutes,
    calculateWorkTime,
    formatMinutesToTime
  };
};
