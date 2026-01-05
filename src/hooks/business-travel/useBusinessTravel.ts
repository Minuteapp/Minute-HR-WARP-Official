
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BusinessTrip, Expense, BusinessTripReport } from '@/types/business-travel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBusinessTravel = (tripId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all business trips
  const { 
    data: trips = [], 
    isLoading: isLoadingTrips,
    error: tripsError,
    refetch: refetchTrips
  } = useQuery({
    queryKey: ['business-trips'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('business_trips')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as BusinessTrip[];
      } catch (error: any) {
        console.error('Error fetching business trips:', error);
        toast.error(`Fehler beim Laden der Geschäftsreisen: ${error.message}`);
        return [];
      }
    }
  });

  // Fetch a specific business trip
  const {
    data: trip,
    isLoading: isLoadingTrip,
    error: tripError
  } = useQuery({
    queryKey: ['business-trip', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      
      try {
        const { data, error } = await supabase
          .from('business_trips')
          .select('*')
          .eq('id', tripId)
          .single();
          
        if (error) throw error;
        return data as BusinessTrip;
      } catch (error: any) {
        console.error('Error fetching business trip:', error);
        toast.error(`Fehler beim Laden der Geschäftsreise: ${error.message}`);
        return null;
      }
    },
    enabled: !!tripId
  });

  // Fetch expenses for a specific trip
  const {
    data: expenses = [],
    isLoading: isLoadingExpenses
  } = useQuery({
    queryKey: ['business-trip-expenses', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      
      try {
        const { data, error } = await supabase
          .from('business_trip_expenses')
          .select('*')
          .eq('business_trip_id', tripId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as Expense[];
      } catch (error: any) {
        console.error('Error fetching expenses:', error);
        toast.error(`Fehler beim Laden der Ausgaben: ${error.message}`);
        return [];
      }
    },
    enabled: !!tripId
  });

  // Fetch report for a specific trip
  const {
    data: report,
    isLoading: isLoadingReport
  } = useQuery({
    queryKey: ['business-trip-report', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      
      try {
        const { data, error } = await supabase
          .from('business_trip_reports')
          .select('*')
          .eq('business_trip_id', tripId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error; // ignore not found errors
        return data as BusinessTripReport;
      } catch (error: any) {
        console.error('Error fetching report:', error);
        toast.error(`Fehler beim Laden des Reiseberichts: ${error.message}`);
        return null;
      }
    },
    enabled: !!tripId
  });

  // Request a new business trip
  const requestTrip = useCallback(async (tripData: any) => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      const { data, error } = await supabase
        .from('business_trips')
        .insert({
          ...tripData,
          employee_id: userId || tripData.employee_id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Geschäftsreise erfolgreich beantragt');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      return true;
    } catch (error: any) {
      console.error('Error requesting business trip:', error);
      toast.error(`Fehler beim Beantragen der Geschäftsreise: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [queryClient]);

  // Approve a business trip
  const approveTrip = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;
      
      const { error } = await supabase
        .from('business_trips')
        .update({
          status: 'approved',
          approver_id: approverId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Geschäftsreise erfolgreich genehmigt');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', id] });
      return true;
    } catch (error: any) {
      console.error('Error approving business trip:', error);
      toast.error(`Fehler beim Genehmigen der Geschäftsreise: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [queryClient]);

  // Reject a business trip
  const rejectTrip = useCallback(async (id: string, reason: string) => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;
      
      const { error } = await supabase
        .from('business_trips')
        .update({
          status: 'rejected',
          approver_id: approverId,
          approved_at: new Date().toISOString(),
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Geschäftsreise abgelehnt');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', id] });
      return true;
    } catch (error: any) {
      console.error('Error rejecting business trip:', error);
      toast.error(`Fehler beim Ablehnen der Geschäftsreise: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [queryClient]);

  // Mark a business trip as completed
  const completeTrip = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('business_trips')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Geschäftsreise als abgeschlossen markiert');
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', id] });
      return true;
    } catch (error: any) {
      console.error('Error completing business trip:', error);
      toast.error(`Fehler beim Abschließen der Geschäftsreise: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [queryClient]);

  // Add expense to a business trip
  const addExpense = useCallback(async (expenseData: any) => {
    if (!tripId) return false;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('business_trip_expenses')
        .insert({
          ...expenseData,
          business_trip_id: tripId,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Ausgabe erfolgreich hinzugefügt');
      queryClient.invalidateQueries({ queryKey: ['business-trip-expenses', tripId] });
      return true;
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(`Fehler beim Hinzufügen der Ausgabe: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [tripId, queryClient]);

  // Submit a report for a business trip
  const submitReport = useCallback(async (reportData: any) => {
    if (!tripId) return false;
    
    setIsSubmitting(true);
    try {
      // Check if report already exists
      const { data: existingReport } = await supabase
        .from('business_trip_reports')
        .select('id')
        .eq('business_trip_id', tripId)
        .single();
      
      let result;
      const now = new Date().toISOString();
      
      if (existingReport) {
        // Update existing report
        const { error } = await supabase
          .from('business_trip_reports')
          .update({
            ...reportData,
            updated_at: now
          })
          .eq('id', existingReport.id);
          
        if (error) throw error;
      } else {
        // Create new report
        const { error } = await supabase
          .from('business_trip_reports')
          .insert({
            ...reportData,
            business_trip_id: tripId,
            created_at: now,
            updated_at: now
          });
          
        if (error) throw error;
      }
      
      // Update business trip to mark report as submitted
      await supabase
        .from('business_trips')
        .update({
          report_submitted_at: now
        })
        .eq('id', tripId);
      
      toast.success('Reisebericht erfolgreich gespeichert');
      queryClient.invalidateQueries({ queryKey: ['business-trip-report', tripId] });
      queryClient.invalidateQueries({ queryKey: ['business-trip', tripId] });
      return true;
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error(`Fehler beim Speichern des Reiseberichts: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [tripId, queryClient]);

  return {
    // Data
    trips,
    trip,
    expenses,
    report,
    
    // Loading states
    isLoadingTrips,
    isLoadingTrip,
    isLoadingExpenses,
    isLoadingReport,
    isSubmitting,
    
    // Errors
    tripsError,
    tripError,
    
    // Functions
    requestTrip,
    approveTrip,
    rejectTrip,
    completeTrip,
    addExpense,
    submitReport,
    refetchTrips
  };
};
