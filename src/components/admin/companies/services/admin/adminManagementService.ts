
import { supabase } from "@/integrations/supabase/client";
import { handleAdminServiceError, validateRpcResult } from "./adminServiceBase";

/**
 * Updates an admin's information
 */
export const updateAdminService = async (
  adminId: string,
  companyId: string,
  name: string,
  phone: string | null = null,
  position: string | null = null,
  salutation: string = 'Herr'
) => {
  try {
    const { data, error } = await supabase.rpc(
      'update_admin_invitation',
      { 
        p_id: adminId,
        p_company_id: companyId,
        p_full_name: name,
        p_phone: phone,
        p_position: position,
        p_salutation: salutation || 'Herr'
      }
    );
    
    if (error) {
      return handleAdminServiceError(error, "Aktualisieren des Administrators");
    }
    
    return validateRpcResult(data, "Fehler beim Aktualisieren des Administrators");
  } catch (error) {
    return handleAdminServiceError(error, "Aktualisieren des Administrators");
  }
};

/**
 * Deletes an admin invitation
 */
export const deleteAdminService = async (
  adminId: string,
  companyId: string
) => {
  try {
    const { data, error } = await supabase.rpc(
      'delete_admin_invitation',
      { 
        p_id: adminId,
        p_company_id: companyId
      }
    );
    
    if (error) {
      return handleAdminServiceError(error, "Löschen des Administrators");
    }
    
    return validateRpcResult(data, "Fehler beim Löschen des Administrators");
  } catch (error) {
    return handleAdminServiceError(error, "Löschen des Administrators");
  }
};
