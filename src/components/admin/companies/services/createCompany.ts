
import { supabase } from "@/integrations/supabase/client";
import { CompanyFormData } from "../types";

/**
 * Creates a new company with completely isolated data
 * NO MOCK DATA - completely clean slate for new customers
 */
export const createCompany = async (formData: CompanyFormData): Promise<any> => {
  console.log("Creating new company with data:", formData);
  
  try {
    // Generiere einen einzigartigen Slug für die neue Firma
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[äöüß]/g, (match) => {
          const replacements: { [key: string]: string } = {
            'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'
          };
          return replacements[match] || match;
        })
        .replace(/[^a-z0-9\s-]/g, '') // Entferne Sonderzeichen
        .trim()
        .replace(/\s+/g, '-') // Leerzeichen zu Bindestrichen
        .replace(/-+/g, '-'); // Multiple Bindestriche zu einem
    };
    
    const baseSlug = generateSlug(formData.name);
    
    // Prüfe ob der Slug bereits existiert und füge eine eindeutige ID hinzu
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('slug')
      .eq('slug', baseSlug)
      .maybeSingle();
    
    // Wenn Slug existiert, füge eine UUID hinzu
    const uniqueSlug = existingCompany 
      ? `${baseSlug}-${crypto.randomUUID().split('-')[0]}`
      : baseSlug;
    
    // Erstelle die neue Firma direkt in der companies Tabelle
    const { data, error } = await supabase
      .from('companies')
      .insert([
        {
          name: formData.name,
          slug: uniqueSlug,
          address: `${formData.street || ''} ${formData.house_number || ''}, ${formData.postal_code || ''} ${formData.city || ''}`.trim(),
          primary_contact_email: formData.email,
          billing_email: formData.email,
          phone: formData.phone,
          website: formData.website,
          subscription_status: formData.subscription_status || 'trial',
          tax_id: formData.tax_id,
          vat_id: formData.vat_id,
          contact_person: formData.contact_person,
          is_active: true,
          employee_count: 0,
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating company:", error);
      throw new Error(`Fehler beim Erstellen der Firma: ${error.message}`);
    }
    
    console.log("Company created successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Create company error:", error);
    throw error;
  }
};
