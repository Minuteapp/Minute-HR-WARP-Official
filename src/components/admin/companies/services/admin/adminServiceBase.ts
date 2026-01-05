
import { supabase } from "@/integrations/supabase/client";

/**
 * Basis-Hilfsfunktion für Fehlerbehandlung bei Admin-Operationen
 */
export const handleAdminServiceError = (error: any, operation: string): never => {
  console.error(`Error in ${operation}:`, error);
  
  // Spezielle Behandlung für häufige Auth-Fehler
  if (error?.code === 'user_already_exists') {
    throw new Error(`Ein Benutzer mit dieser E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse oder laden Sie den existierenden Benutzer zur Firma ein.`);
  }
  
  throw new Error(`Fehler beim ${operation}: ${error.message}`);
};

/**
 * Prüft das Ergebnis einer RPC-Funktion auf Erfolg
 */
export const validateRpcResult = (data: any, errorMessage: string): any => {
  // Prüfen, ob die Funktion einen Fehler in den Daten zurückgegeben hat
  if (data && !data.success) {
    console.error(`Error in admin service function:`, data.message);
    throw new Error(data.message || errorMessage);
  }
  
  return data;
};
