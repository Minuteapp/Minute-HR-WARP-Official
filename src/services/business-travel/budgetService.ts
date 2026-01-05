
import { BudgetPlan } from "@/types/business-travel";
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
 * Fetches all budget plans
 */
export const fetchBudgetPlans = async (): Promise<BudgetPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budget plans:', error);
      return [];
    }

    return data as BudgetPlan[];
  } catch (error) {
    console.error('Error fetching budget plans:', error);
    return [];
  }
};

/**
 * Fetches a specific budget plan by ID
 */
export const fetchBudgetPlanById = async (id: string): Promise<BudgetPlan | null> => {
  try {
    const { data, error } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching budget plan:', error);
      return null;
    }

    return data as BudgetPlan;
  } catch (error) {
    console.error('Error fetching budget plan:', error);
    return null;
  }
};

/**
 * Creates a new budget plan
 */
export const createBudgetPlan = async (budgetData: Omit<BudgetPlan, 'id' | 'created_at' | 'updated_at' | 'used_amount' | 'reserved_amount' | 'remaining_amount'>): Promise<BudgetPlan | null> => {
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
      console.error('No company context available for budget plan creation');
      return null;
    }

    const { data, error } = await supabase
      .from('budget_plans')
      .insert({
        ...budgetData,
        created_by: userId,
        company_id: companyId,
        used_amount: 0,
        reserved_amount: 0,
        remaining_amount: budgetData.amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating budget plan:', error);
      return null;
    }

    return data as BudgetPlan;
  } catch (error) {
    console.error('Error creating budget plan:', error);
    return null;
  }
};

/**
 * Fetches business trips for a specific budget plan
 */
export const fetchBudgetPlanTrips = async (budgetId: string) => {
  try {
    const { data, error } = await supabase
      .from('business_trips')
      .select('*')
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budget plan trips:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching budget plan trips:', error);
    return [];
  }
};
