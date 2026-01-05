
import { supabase } from "@/integrations/supabase/client";
import { CompanyDetails } from "../types";

export async function fetchCompanyDetails(companyId: string): Promise<CompanyDetails | null> {
  console.log("Fetching details for company ID:", companyId);
  
  try {
    // Edge-Funktion aufrufen, um Firmendetails zu holen (mit Service Role Berechtigung)
    console.log("Calling fetch-company-details Edge Function with service role");
    
    const { data, error } = await supabase.functions.invoke('fetch-company-details', {
      body: { companyId }
    });
    
    if (error) {
      console.error("Error calling Edge Function:", error);
      throw new Error(`Failed to fetch company: ${error.message}`);
    }
    
    if (!data) {
      console.log("No company data returned from Edge Function");
      return null;
    }
    
    console.log("Company data received from Edge Function:", data);
    return data as CompanyDetails;
    
  } catch (error: any) {
    console.error("Error in fetchCompanyDetails:", error);
    throw error;
  }
}
