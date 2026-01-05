import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBusinessTravel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: travelRequests = [], isLoading } = useQuery({
    queryKey: ['business-travel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: budgetPlans = [], isLoading: isLoadingBudgetPlans, refetch: refetchBudgetPlans } = useQuery({
    queryKey: ['budget-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_travel_budget_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const createTravelRequest = useMutation({
    mutationFn: async (travelData: any) => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .insert([travelData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Geschäftsreise erstellt",
        description: "Die Geschäftsreise wurde erfolgreich erstellt.",
      });
    },
  });

  const requestTrip = useMutation({
    mutationFn: async (tripData: any) => createTravelRequest.mutateAsync(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Reise beantragt",
        description: "Ihr Reiseantrag wurde eingereicht.",
      });
    },
  });

  const approveTrip = useMutation({
    mutationFn: async (tripId: string) => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .update({ status: 'approved' })
        .eq('id', tripId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Reise genehmigt",
        description: "Die Geschäftsreise wurde genehmigt.",
      });
    },
  });

  const rejectTrip = useMutation({
    mutationFn: async ({ tripId, reason }: { tripId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', tripId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Reise abgelehnt",
        description: "Die Geschäftsreise wurde abgelehnt.",
      });
    },
  });

  const completeTrip = useMutation({
    mutationFn: async (tripId: string) => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .update({ status: 'completed' })
        .eq('id', tripId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Reise abgeschlossen",
        description: "Die Geschäftsreise wurde als abgeschlossen markiert.",
      });
    },
  });

  const addExpense = useMutation({
    mutationFn: async (expenseData: any) => {
      const { data, error } = await supabase
        .from('business_travel_expenses')
        .insert([expenseData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Ausgabe hinzugefügt",
        description: "Die Ausgabe wurde erfolgreich hinzugefügt.",
      });
    },
  });

  const submitReport = useMutation({
    mutationFn: async (reportData: any) => {
      const { data, error } = await supabase
        .from('business_travel_reports')
        .insert([reportData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-travel'] });
      toast({
        title: "Bericht eingereicht",
        description: "Der Reisebericht wurde erfolgreich eingereicht.",
      });
    },
  });

  const createBudgetPlan = useMutation({
    mutationFn: async (budgetData: any) => {
      const { data, error } = await supabase
        .from('business_travel_budget_plans')
        .insert([budgetData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
      toast({
        title: "Budget-Plan erstellt",
        description: "Der Budget-Plan wurde erfolgreich erstellt.",
      });
    },
  });

  const getBudgetPlanById = (planId: string) => {
    return budgetPlans.find(plan => plan.id === planId);
  };

  const getBudgetPlanTrips = (planId: string) => {
    return travelRequests.filter(trip => trip.budget_plan_id === planId);
  };

  return {
    travelRequests,
    budgetPlans,
    isLoading,
    isLoadingBudgetPlans,
    refetchBudgetPlans,
    createTravelRequest: createTravelRequest.mutateAsync,
    requestTrip: requestTrip.mutateAsync,
    approveTrip: approveTrip.mutateAsync,
    rejectTrip: rejectTrip.mutateAsync,
    completeTrip: completeTrip.mutateAsync,
    addExpense: addExpense.mutateAsync,
    submitReport: submitReport.mutateAsync,
    createBudgetPlan: createBudgetPlan.mutateAsync,
    getBudgetPlanById,
    getBudgetPlanTrips,
    isCreating: createTravelRequest.isPending,
    isSubmitting: createTravelRequest.isPending || requestTrip.isPending || approveTrip.isPending || rejectTrip.isPending || completeTrip.isPending || addExpense.isPending || submitReport.isPending || createBudgetPlan.isPending,
  };
};