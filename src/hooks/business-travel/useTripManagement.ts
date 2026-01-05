
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TripFormData, BudgetPlan } from '@/types/business-travel';
import { toast } from 'sonner';
import { 
  fetchBusinessTrips, 
  fetchBusinessTrip,
  createBusinessTrip,
  approveBusinessTrip,
  rejectBusinessTrip,
  completeBusinessTrip 
} from '@/services/business-travel/tripService';
import {
  fetchBudgetPlans,
  fetchBudgetPlanById,
  fetchBudgetPlanTrips,
  createBudgetPlan
} from '@/services/business-travel/budgetService';
import { useFlightManagement } from './useFlightManagement';
import { useAiSuggestions } from './useAiSuggestions';

export const useTripManagement = (tripId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Basis-Queries für Reisen
  const { data: trips = [], isLoading: isLoadingTrips, error: tripsError } = useQuery({
    queryKey: ['business-trips'],
    queryFn: fetchBusinessTrips
  });

  const { data: trip, isLoading: isLoadingTrip, error: tripError } = useQuery({
    queryKey: ['business-trip', tripId],
    queryFn: () => fetchBusinessTrip(tripId!),
    enabled: !!tripId
  });

  // Erweiterte Funktionalitäten
  const flightManagement = useFlightManagement(tripId || '');
  const aiSuggestions = useAiSuggestions(tripId || '');

  // Queries für Budgets
  const { data: budgetPlans = [], isLoading: isLoadingBudgetPlans } = useQuery({
    queryKey: ['budget-plans'],
    queryFn: fetchBudgetPlans
  });

  // Mutations für Reisen
  const createTripMutation = useMutation({
    mutationFn: (data: TripFormData) => createBusinessTrip(data),
    onSuccess: (newTrip) => {
      toast.success('Geschäftsreise wurde erfolgreich beantragt');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      
      // Automatisch AI-Vorschläge generieren für neue Reise
      if (newTrip) {
        aiSuggestions.generateSuggestions(newTrip.destination, newTrip.purpose);
      }
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen der Geschäftsreise:', error);
      toast.error('Fehler beim Erstellen der Geschäftsreise');
    }
  });

  const approveTripMutation = useMutation({
    mutationFn: (id: string) => approveBusinessTrip(id),
    onSuccess: () => {
      toast.success('Geschäftsreise wurde genehmigt');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', tripId] });
    }
  });

  const rejectTripMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => rejectBusinessTrip(id, reason),
    onSuccess: () => {
      toast.success('Geschäftsreise wurde abgelehnt');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', tripId] });
    }
  });

  const completeTripMutation = useMutation({
    mutationFn: (id: string) => completeBusinessTrip(id),
    onSuccess: () => {
      toast.success('Geschäftsreise wurde abgeschlossen');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', tripId] });
    }
  });

  // Mutations für Budgets
  const createBudgetPlanMutation = useMutation({
    mutationFn: (data: BudgetPlan) => createBudgetPlan(data),
    onSuccess: () => {
      toast.success('Budget wurde erfolgreich erstellt');
      queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen des Budgets:', error);
      toast.error('Fehler beim Erstellen des Budgets');
    }
  });

  // Handler functions for trips
  const requestTrip = async (data: TripFormData) => {
    try {
      setIsSubmitting(true);
      await createTripMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveTrip = async (id: string) => {
    try {
      setIsSubmitting(true);
      await approveTripMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectTrip = async (id: string, reason: string) => {
    try {
      setIsSubmitting(true);
      await rejectTripMutation.mutateAsync({ id, reason });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeTrip = async (id: string) => {
    try {
      setIsSubmitting(true);
      await completeTripMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler functions for budgets
  const addBudget = async (data: BudgetPlan) => {
    try {
      setIsSubmitting(true);
      await createBudgetPlanMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBudgetPlanById = async (budgetId: string) => {
    return fetchBudgetPlanById(budgetId);
  };

  const getBudgetPlanTrips = async (budgetId: string) => {
    return fetchBudgetPlanTrips(budgetId);
  };

  const refetchBudgetPlans = () => {
    queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
  };

  return {
    // Data
    trips,
    trip,
    budgetPlans,
    
    // Loading states
    isLoadingTrips,
    isLoadingTrip,
    isLoadingBudgetPlans,
    isSubmitting,
    
    // Errors
    tripsError,
    tripError,
    
    // Trip functions
    requestTrip,
    approveTrip,
    rejectTrip,
    completeTrip,
    
    // Budget functions
    createBudgetPlan,
    addBudget,
    getBudgetPlanById,
    getBudgetPlanTrips,
    refetchBudgetPlans,

    // Erweiterte Funktionalitäten
    flightManagement,
    aiSuggestions
  };
};
