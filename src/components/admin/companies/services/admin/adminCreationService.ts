
import { supabase } from "@/integrations/supabase/client";
import { handleAdminServiceError, validateRpcResult } from "./adminServiceBase";

/**
 * Creates a new admin invitation in the database
 */
export const createAdminInvitationService = async (
  email: string,
  companyId: string,
  name: string,
  phone: string | null = null,
  position: string | null = null,
  salutation: string = 'Herr'
) => {
  try {
    const { data, error } = await supabase.rpc(
      'create_admin_invitation',
      { 
        p_email: email,
        p_company_id: companyId,
        p_full_name: name,
        p_phone: phone,
        p_position: position,
        p_salutation: salutation || 'Herr'
      }
    );
    
    if (error) {
      return handleAdminServiceError(error, "Speichern der Einladung");
    }
    
    return validateRpcResult(data, "Fehler beim Erstellen des Administrators");
  } catch (error) {
    return handleAdminServiceError(error, "Erstellen der Admin-Einladung");
  }
};
