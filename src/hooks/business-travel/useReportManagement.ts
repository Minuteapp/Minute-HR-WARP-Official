
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReportFormData } from '@/types/business-travel';
import { toast } from 'sonner';
import { 
  fetchBusinessTripReport,
  saveBusinessTripReport 
} from '@/services/business-travel/reportService';

export const useReportManagement = (tripId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: ['business-trip-report', tripId],
    queryFn: () => fetchBusinessTripReport(tripId),
    enabled: !!tripId
  });

  const saveReportMutation = useMutation({
    mutationFn: (data: ReportFormData) => saveBusinessTripReport(tripId, data),
    onSuccess: () => {
      toast.success('Reisebericht wurde erfolgreich gespeichert');
      queryClient.invalidateQueries({ queryKey: ['business-trip-report', tripId] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', tripId] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Speichern des Reiseberichts:', error);
      toast.error('Fehler beim Speichern des Reiseberichts');
    }
  });

  const submitReport = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);
      await saveReportMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    report,
    isLoadingReport,
    isSubmitting,
    submitReport
  };
};
