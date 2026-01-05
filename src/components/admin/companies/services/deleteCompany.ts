
import { supabase } from "@/integrations/supabase/client";

/**
 * Löscht eine Firma anhand ihrer ID
 * Verwendet eine SECURITY DEFINER Funktion in der Datenbank,
 * die mit erhöhten Berechtigungen ausgeführt wird
 */
export const deleteCompany = async (companyId: string): Promise<void> => {
  console.log("Löschen der Firma mit ID:", companyId);
  
  if (!companyId) {
    console.error("Fehlende Firmen-ID");
    throw new Error("Firmen-ID ist erforderlich");
  }
  
  try {
    console.log("Starte RPC-Aufruf zum Löschen der Firma");
    
    // Call the RPC directly within the try/catch block
    const { data, error } = await supabase.rpc('delete_company', {
      company_id_param: companyId
    });
    
    if (error) {
      console.error("Fehler beim Löschen der Firma:", error);
      throw new Error(`Löschen der Firma fehlgeschlagen: ${error.message}`);
    }
    
    console.log("Firma erfolgreich gelöscht", data);
    return;
  } catch (error: any) {
    console.error("Unerwarteter Fehler beim Löschen der Firma:", error);
    throw new Error(`Unerwarteter Fehler beim Löschen der Firma: ${error.message || error}`);
  }
};
