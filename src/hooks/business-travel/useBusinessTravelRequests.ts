import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface BusinessTravelRequest {
  id: string;
  user_id: string;
  employee_name?: string;
  department?: string;
  destination: string;
  purpose: string;
  start_date: string;
  end_date: string;
  estimated_cost: number;
  cost_center?: string;
  flight_preferences: any;
  hotel_preferences: any;
  car_rental_needed: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  current_approval_step: number;
  risk_score: number;
  booking_reference?: string;
  actual_cost: number;
  receipts: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface TravelApproval {
  id: string;
  travel_request_id: string;
  approver_id?: string;
  approver_name?: string;
  approver_role: string;
  step_number: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejected_at?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelRequestData {
  destination: string;
  purpose: string;
  start_date: string;
  end_date: string;
  estimated_cost: number;
  cost_center?: string;
  flight_preferences?: any;
  hotel_preferences?: any;
  car_rental_needed?: boolean;
}

export const useBusinessTravelRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's travel requests
  const {
    data: travelRequests,
    isLoading: isLoadingRequests,
    error: requestsError
  } = useQuery({
    queryKey: ['travel-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('business_travel_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BusinessTravelRequest[];
    },
    enabled: !!user?.id
  });

  // Fetch all travel requests (admin view)
  const {
    data: allTravelRequests,
    isLoading: isLoadingAllRequests,
    error: allRequestsError
  } = useQuery({
    queryKey: ['all-travel-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BusinessTravelRequest[];
    }
  });

  // Fetch approvals for user's requests
  const {
    data: approvals,
    isLoading: isLoadingApprovals
  } = useQuery({
    queryKey: ['travel-approvals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('travel_approvals')
        .select(`
          *,
          business_travel_requests!inner(user_id)
        `)
        .eq('business_travel_requests.user_id', user.id);
      
      if (error) throw error;
      return data as TravelApproval[];
    },
    enabled: !!user?.id
  });

  // Create travel request mutation
  const createTravelRequestMutation = useMutation({
    mutationFn: async (data: CreateTravelRequestData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get company_id
      const { data: companyId, error: rpcError } = await supabase.rpc('get_effective_company_id');
      if (rpcError || !companyId) {
        console.error('Failed to get company_id:', rpcError);
        throw new Error('Keine Firma zugeordnet. Bitte prüfen Sie Ihre Firmenzuordnung.');
      }

      // Get employee info
      const { data: employee } = await supabase
        .from('employees')
        .select('name, department')
        .eq('id', user.id)
        .single();

      const requestData = {
        ...data,
        user_id: user.id,
        company_id: companyId,
        employee_name: employee?.name || user.email,
        department: employee?.department || 'Unbekannt',
        status: 'pending'
      };

      const { data: result, error } = await supabase
        .from('business_travel_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-travel-requests'] });
      toast({
        title: "Reiseantrag erstellt",
        description: "Ihr Reiseantrag wurde erfolgreich eingereicht und wird nun geprüft.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message || "Der Reiseantrag konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  });

  // Update travel request status (admin)
  const updateTravelRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BusinessTravelRequest> }) => {
      const { data, error } = await supabase
        .from('business_travel_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-travel-requests'] });
      queryClient.invalidateQueries({ queryKey: ['travel-map-pins'] });
      toast({
        title: "Reiseantrag aktualisiert",
        description: "Der Reiseantrag wurde erfolgreich bearbeitet.",
      });
    }
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('travel-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_travel_requests',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['travel-requests'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_approvals'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['travel-approvals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    // Data
    travelRequests: travelRequests || [],
    allTravelRequests: allTravelRequests || [],
    approvals: approvals || [],
    
    // Loading states
    isLoadingRequests,
    isLoadingAllRequests,
    isLoadingApprovals,
    
    // Mutations
    createTravelRequest: createTravelRequestMutation.mutate,
    updateTravelRequest: updateTravelRequestMutation.mutate,
    isCreating: createTravelRequestMutation.isPending,
    isUpdating: updateTravelRequestMutation.isPending,
    
    // Errors
    requestsError,
    allRequestsError
  };
};