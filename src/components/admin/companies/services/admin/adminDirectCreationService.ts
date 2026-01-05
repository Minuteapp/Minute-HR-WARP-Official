import { supabase } from "@/integrations/supabase/client";
import { handleAdminServiceError } from "./adminServiceBase";

/**
 * Creates an admin user directly with a password (for testing purposes)
 */
export const createAdminUserWithPasswordService = async (
  email: string,
  password: string,
  companyId: string,
  name: string,
  phone: string | null = null,
  position: string | null = null,
  salutation: string = 'Herr'
) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {
        email,
        password,
        companyId,
        fullName: name,
        phone,
        position,
        salutation: salutation || 'Herr'
      }
    });
    
    if (error) {
      return handleAdminServiceError(error, "Erstellen des Admin-Benutzers");
    }
    
    if (!data?.success) {
      throw new Error(data?.message || "Fehler beim Erstellen des Admin-Benutzers");
    }
    
    return data;
  } catch (error) {
    return handleAdminServiceError(error, "Erstellen des Admin-Benutzers mit Passwort");
  }
};