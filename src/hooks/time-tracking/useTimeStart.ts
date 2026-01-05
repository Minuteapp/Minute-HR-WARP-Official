
import { useToast } from "@/hooks/use-toast";
import { timeTrackingService } from '@/services/timeTrackingService';
import { useQueryClient } from '@tanstack/react-query';

interface UseTimeStartProps {
  user: any;
  setIsTracking: (value: boolean) => void;
  setTrackingStartTime: (value: Date | null) => void;
  setElapsedTime: (value: number) => void;
  setPausedTime: (value: number) => void;
  setLastDisplayTime?: (value: number) => void;
}

export const useTimeStart = ({
  user,
  setIsTracking,
  setTrackingStartTime,
  setElapsedTime,
  setPausedTime,
  setLastDisplayTime
}: UseTimeStartProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTimeAction = async (data?: any) => {
    try {
      console.log('🚀 Starting time tracking with data:', data);
      
      // Prüfe Authentifizierung
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Authentifizierung erforderlich",
          description: "Bitte melden Sie sich an, um die Zeiterfassung zu verwenden.",
        });
        return false;
      }
      
      const safeData = {
        project: data?.project || 'general',
        location: data?.location || 'office',
        note: data?.note || '',
        office_location_id: data?.office_location_id,
        user_id: user.id,
        start_time: new Date().toISOString()
      };
      
      console.log('📤 Submitting time tracking data:', safeData);
      
      const result = await timeTrackingService.startTimeTracking(safeData);
      console.log('✅ Time tracking started successfully:', result);
      
      // Queries sofort invalidieren und refetchen erzwingen
      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', user?.id], refetchType: 'active' });
      await queryClient.refetchQueries({ queryKey: ['activeTimeEntry', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
      
      // Lokalen Zustand sofort setzen
      const startTime = new Date();
      setTrackingStartTime(startTime);
      setIsTracking(true);
      setElapsedTime(0);
      if (setLastDisplayTime) setLastDisplayTime(0);
      setPausedTime(0);
      
      toast({
        title: "Zeiterfassung gestartet",
        description: "Ihre Arbeitszeit wird jetzt erfasst.",
      });
      
      console.log('🎯 Time tracking state updated locally');
      
      return true;
    } catch (error: any) {
      console.error('❌ Error starting time tracking:', error);
      
      // Reset state on error
      setIsTracking(false);
      setTrackingStartTime(null);
      setElapsedTime(0);
      if (setLastDisplayTime) setLastDisplayTime(0);
      setPausedTime(0);
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Zeiterfassung konnte nicht gestartet werden.",
      });
      return false;
    }
  };

  return { handleTimeAction };
};

export const invalidateQueries = async (queryClient: any, userId?: string) => {
  await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', userId] });
  await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
  await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
};
