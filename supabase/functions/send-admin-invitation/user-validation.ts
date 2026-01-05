
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface UserCheckResult {
  exists: boolean;
  error?: string;
}

export const checkIfUserExists = async (
  supabase: any,
  email: string
): Promise<UserCheckResult> => {
  try {
    console.log(`Überprüfe, ob Benutzer existiert: ${email}`);
    
    // Prüfe in der auth.users Tabelle
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Fehler beim Abrufen der Benutzerliste:", error);
      return { exists: false, error: `Fehler beim Überprüfen des Benutzers: ${error.message}` };
    }
    
    const userExists = data?.users?.some((user: any) => 
      user.email?.toLowerCase() === email.toLowerCase()
    );
    
    console.log(`Benutzer ${email} existiert bereits: ${userExists}`);
    
    return { exists: !!userExists };
  } catch (error: any) {
    console.error("Fehler bei der Benutzerüberprüfung:", error);
    return { exists: false, error: `Unerwarteter Fehler: ${error.message}` };
  }
};
