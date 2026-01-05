
import { supabase } from "@/integrations/supabase/client";

/**
 * Deactivates a company by ID
 */
export const deactivateCompany = async (companyId: string): Promise<void> => {
  console.log("Deactivating company with ID:", companyId);
  
  // Use the deactivate_company RPC function
  const { error } = await supabase.rpc('deactivate_company', {
    p_company_id: companyId
  });
  
  if (error) {
    console.error("Error deactivating company:", error);
    throw new Error(`Failed to deactivate company: ${error.message}`);
  }
  
  console.log("Company deactivated successfully");
};
