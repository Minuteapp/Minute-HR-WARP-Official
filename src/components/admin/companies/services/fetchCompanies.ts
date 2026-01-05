
import { supabase } from "@/integrations/supabase/client";
import { CompanyData } from "../types";

/**
 * Fetches active companies from the database
 * Using get_active_companies RPC function to avoid permission issues
 */
export const fetchCompanies = async (): Promise<CompanyData[]> => {
  console.log("Starting companies fetch operation");
  
  try {
    // Use the improved get_active_companies RPC function with SECURITY DEFINER
    // which has explicitly named column references to avoid permission issues
    console.log("Executing get_active_companies RPC function");
    const { data, error } = await supabase
      .rpc('get_active_companies');
    
    if (error) {
      console.error("Supabase fetch companies error:", error);
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
    
    console.log("Companies data retrieved successfully:", data?.length || 0, "companies found");
    
    // Transform the data to match CompanyData type
    const companies: CompanyData[] = (data || []).map((company: any) => ({
      company_id: company.id,
      company_name: company.name,
      employee_count: company.employee_count,
      subscription_status: company.subscription_status,
      is_active: company.is_active,
      slug: company.slug
    }));
    
    return companies;
  } catch (error: any) {
    console.error("Fatal error in fetchCompanies function:", error);
    throw error; // Propagate the error for React Query to handle
  }
};
