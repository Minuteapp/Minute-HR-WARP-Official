
import { BusinessTrip, TripFormData } from "@/types/business-travel";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get user's company ID
const getUserCompanyId = async (userId: string | undefined): Promise<string | null> => {
  if (!userId) return null;
  
  const { data } = await supabase
    .from('user_roles')
    .select('company_id')
    .eq('user_id', userId)
    .maybeSingle();
    
  return data?.company_id || null;
};

/**
 * Fetches all business trips for the current user
 */
export const fetchBusinessTrips = async (): Promise<BusinessTrip[]> => {
  try {
    // In a real application, you would filter by the current user
    const { data, error } = await supabase
      .from('business_trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching business trips:', error);
      return [];
    }

    return data as BusinessTrip[];
  } catch (error) {
    console.error('Error fetching business trips:', error);
    return [];
  }
};

/**
 * Fetches a specific business trip by ID
 */
export const fetchBusinessTrip = async (id: string): Promise<BusinessTrip | null> => {
  try {
    const { data, error } = await supabase
      .from('business_trips')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching business trip:', error);
      return null;
    }

    return data as BusinessTrip;
  } catch (error) {
    console.error('Error fetching business trip:', error);
    return null;
  }
};

/**
 * Creates a new business trip request
 */
export const createBusinessTrip = async (tripData: TripFormData): Promise<BusinessTrip | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    // Get current tenant company ID or user's company ID
    const { data: tenantData } = await supabase
      .from('user_tenant_sessions')
      .select('tenant_company_id')
      .eq('user_id', userId)
      .eq('is_tenant_mode', true)
      .maybeSingle();

    const companyId = tenantData?.tenant_company_id || await getUserCompanyId(userId);

    if (!companyId) {
      console.error('No company context available for business trip creation');
      return null;
    }

    const { data, error } = await supabase
      .from('business_trips')
      .insert({
        employee_id: userId || tripData.employee_id,
        employee_name: tripData.employee_name,
        department: tripData.department,
        supervisor: tripData.supervisor,
        purpose: tripData.purpose,
        purpose_type: tripData.purpose_type,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        destination: tripData.destination,
        destination_address: tripData.destination_address,
        transport: tripData.transport,
        hotel_required: tripData.hotel_required,
        hotel_details: tripData.hotel_details,
        cost_coverage: tripData.cost_coverage,
        cost_center: tripData.cost_center,
        advance_payment: tripData.advance_payment,
        notes: tripData.notes,
        status: 'pending',
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating business trip:', error);
      return null;
    }

    return data as BusinessTrip;
  } catch (error) {
    console.error('Error creating business trip:', error);
    return null;
  }
};

/**
 * Approves a business trip
 */
export const approveBusinessTrip = async (id: string): Promise<boolean> => {
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

    if (error) {
      console.error('Error approving business trip:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error approving business trip:', error);
    return false;
  }
};

/**
 * Rejects a business trip
 */
export const rejectBusinessTrip = async (id: string, reason: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const approverId = userData?.user?.id;
    
    const { error } = await supabase
      .from('business_trips')
      .update({
        status: 'rejected',
        approver_id: approverId,
        approved_at: new Date().toISOString(), // We're using approved_at for rejection date too
        notes: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting business trip:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error rejecting business trip:', error);
    return false;
  }
};

/**
 * Marks a business trip as completed
 */
export const completeBusinessTrip = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('business_trips')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error completing business trip:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing business trip:', error);
    return false;
  }
};
