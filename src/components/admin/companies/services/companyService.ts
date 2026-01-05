import { supabase } from "@/integrations/supabase/client";
import { CompanyFormData } from "../types";
import { initializeNewCompany } from "./companyInitializationService";

/**
 * Fetches all companies from the database
 */
export const fetchCompanies = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .rpc('get_active_companies');
  
  if (error) {
    console.error("Error fetching companies:", error);
    throw new Error(`Fehler beim Laden der Firmen: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Creates a new company and initializes it with default data
 */
export const createCompany = async (formData: CompanyFormData): Promise<any> => {
  // Create company address from form data
  const address = `${formData.street} ${formData.house_number}, ${formData.postal_code} ${formData.city}`;
  
  console.log("Creating new company with data:", {
    name: formData.name,
    address,
    billing_email: formData.email,
  });
  
  // Use the create_clean_company RPC function which ensures no data inheritance
  const { data, error } = await supabase.rpc('create_clean_company', {
    p_name: formData.name,
    p_address: address,
    p_billing_email: formData.email,
    p_phone: formData.phone,
    p_website: formData.website,
    p_subscription_status: formData.subscription_status,
    p_tax_id: formData.tax_id,
    p_vat_id: formData.vat_id,
    p_contact_person: formData.contact_person,
  });
  
  if (error) {
    console.error("Error creating company:", error);
    throw new Error(`Fehler beim Erstellen der Firma: ${error.message}`);
  }
  
  console.log("Company created successfully:", data);
  
  // Initialisiere die neue Firma mit Standard-Daten
  if (data) {
    await initializeNewCompany(data, formData.email);
  }
  
  return data;
};

/**
 * Deactivates a company
 */
export const deactivateCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase.rpc('deactivate_company', {
    p_company_id: companyId
  });
  
  if (error) {
    console.error("Error deactivating company:", error);
    throw new Error(`Fehler beim Deaktivieren der Firma: ${error.message}`);
  }
};

/**
 * Deletes a company and all associated data
 */
export const deleteCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase.rpc('delete_company', {
    company_id_param: companyId
  });
  
  if (error) {
    console.error("Error deleting company:", error);
    throw new Error(`Fehler beim Löschen der Firma: ${error.message}`);
  }
};
