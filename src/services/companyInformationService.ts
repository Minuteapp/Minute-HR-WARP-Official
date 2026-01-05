
import { supabase } from "@/integrations/supabase/client";
import { CompanyInformation, CompanyInformationFormData, Subsidiary, SubsidiaryFormData } from "@/types/company-information";

export const fetchCompanyInformation = async (): Promise<CompanyInformation | null> => {
  const { data, error } = await supabase
    .from('settings_company')
    .select('*')
    .single();

  if (error) {
    console.error("Error fetching company information:", error);
    throw error;
  }

  return data as CompanyInformation;
};

export const updateCompanyInformation = async (companyInfo: CompanyInformationFormData): Promise<CompanyInformation> => {
  const { data, error } = await supabase
    .from('settings_company')
    .update({
      company_name: companyInfo.name,
      address: `${companyInfo.street}, ${companyInfo.postal_code} ${companyInfo.city}`,
      contact_email: companyInfo.email,
      phone: companyInfo.phone,
      logo_url: companyInfo.logo_url,
      tax_id: companyInfo.tax_id,
      vat_id: companyInfo.vat_id,
      contact_person: companyInfo.contact_person,
      website: companyInfo.website
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating company information:", error);
    throw error;
  }

  return data as CompanyInformation;
};

export const fetchSubsidiaries = async (): Promise<Subsidiary[]> => {
  const { data, error } = await supabase
    .from('subsidiaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching subsidiaries:", error);
    throw error;
  }

  return data as Subsidiary[];
};

export const addSubsidiary = async (subsidiary: SubsidiaryFormData): Promise<Subsidiary> => {
  const { data, error } = await supabase
    .from('subsidiaries')
    .insert(subsidiary)
    .select()
    .single();

  if (error) {
    console.error("Error adding subsidiary:", error);
    throw error;
  }

  return data as Subsidiary;
};

export const updateSubsidiary = async (id: string, subsidiary: SubsidiaryFormData): Promise<Subsidiary> => {
  const { data, error } = await supabase
    .from('subsidiaries')
    .update(subsidiary)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating subsidiary:", error);
    throw error;
  }

  return data as Subsidiary;
};

export const deleteSubsidiary = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subsidiaries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting subsidiary:", error);
    throw error;
  }
};
