
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlightDetails } from '@/types/business-travel';
import { toast } from 'sonner';
import { 
  fetchFlightDetails,
  createFlightDetails,
  updateFlightDetails,
  deleteFlightDetails 
} from '@/services/business-travel/flightService';

export const useFlightManagement = (tripId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: flights = [], isLoading: isLoadingFlights } = useQuery({
    queryKey: ['flight-details', tripId],
    queryFn: () => fetchFlightDetails(tripId),
    enabled: !!tripId
  });

  const createFlightMutation = useMutation({
    mutationFn: (data: Omit<FlightDetails, 'id' | 'business_trip_id' | 'created_at' | 'updated_at'>) => 
      createFlightDetails(tripId, data),
    onSuccess: () => {
      toast.success('Flugdetails wurden erfolgreich hinzugefügt');
      queryClient.invalidateQueries({ queryKey: ['flight-details', tripId] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen der Flugdetails:', error);
      toast.error('Fehler beim Erstellen der Flugdetails');
    }
  });

  const updateFlightMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<FlightDetails> }) => 
      updateFlightDetails(id, updates),
    onSuccess: () => {
      toast.success('Flugdetails wurden erfolgreich aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['flight-details', tripId] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Aktualisieren der Flugdetails:', error);
      toast.error('Fehler beim Aktualisieren der Flugdetails');
    }
  });

  const deleteFlightMutation = useMutation({
    mutationFn: (id: string) => deleteFlightDetails(id),
    onSuccess: () => {
      toast.success('Flugdetails wurden erfolgreich gelöscht');
      queryClient.invalidateQueries({ queryKey: ['flight-details', tripId] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Löschen der Flugdetails:', error);
      toast.error('Fehler beim Löschen der Flugdetails');
    }
  });

  const addFlight = async (data: Omit<FlightDetails, 'id' | 'business_trip_id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      await createFlightMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFlight = async (id: string, updates: Partial<FlightDetails>) => {
    try {
      setIsSubmitting(true);
      await updateFlightMutation.mutateAsync({ id, updates });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFlight = async (id: string) => {
    try {
      setIsSubmitting(true);
      await deleteFlightMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    flights,
    isLoadingFlights,
    isSubmitting,
    addFlight,
    updateFlight,
    deleteFlight
  };
};
