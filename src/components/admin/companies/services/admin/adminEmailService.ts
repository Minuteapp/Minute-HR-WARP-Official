import { supabase } from "@/integrations/supabase/client";

/**
 * Sends an invitation email to the administrator with enhanced error handling
 */
export const sendInvitationEmailService = async (
  email: string,
  companyId: string,
  companyName: string
) => {
  console.log("=== ADMIN INVITATION SERVICE START ===");
  console.log("Email:", email);
  console.log("Company ID:", companyId);
  console.log("Company Name:", companyName);
  
  // Validiere E-Mail-Format (einfache Prüfung)
  const emailRegex = /^.+@.+\..+$/;
  if (!emailRegex.test(email)) {
    const error = "Ungültiges E-Mail-Format. Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    console.error("Email validation failed:", error);
    throw new Error(error);
  }
  
  // Validiere Firmen-ID (einfache UUID-Validierung)
  if (!companyId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
    const error = "Ungültige Firmen-ID. Bitte stellen Sie sicher, dass eine gültige Firmen-ID angegeben ist.";
    console.error("Company ID validation failed:", error);
    throw new Error(error);
  }
  
  // Generiere Registrierungslink mit Query-Parametern - Stelle korrekte Kodierung sicher
  const signUpLink = `${window.location.origin}/auth/register?company=${encodeURIComponent(companyId)}&invitation=true&role=admin`;
  console.log("Generated signup link:", signUpLink);
  
  try {
    // Erstelle Request-Body mit erforderlichen Feldern - OHNE JSON.stringify!
    const requestBody = {
      email: email.trim().toLowerCase(),
      companyName: companyName,
      companyId: companyId,
      signUpLink,
      role: 'admin'
    };
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    
    // Rufe Edge-Funktion OHNE explizite Headers auf - Supabase fügt diese automatisch hinzu
    console.log("Calling send-admin-invitation edge function...");
    const { data, error } = await supabase.functions.invoke('send-admin-invitation', {
      body: requestBody
    });
    
    console.log("Edge function response - data:", data);
    console.log("Edge function response - error:", error);
    
    if (error) {
      console.error("Supabase Functions-Fehler:", error);
      throw new Error("Fehler beim Senden der Einladungs-E-Mail: " + (error.message || "Unbekannter Fehler"));
    }
    
    if (!data?.success) {
      console.error("Edge-Funktion hat einen Fehler zurückgegeben:", data?.error || "Unbekannter Fehler");
      throw new Error(data?.error || "Fehler beim Senden der Einladungs-E-Mail");
    }
    
    console.log("Email sent successfully, updating invitation status...");
    
    // Aktualisiere den Einladungsstatus in der Datenbank
    const { data: updateData, error: updateError } = await supabase.rpc('update_admin_invitation', { 
      p_email: email.trim().toLowerCase(),
      p_company_id: companyId
    });
    
    if (updateError) {
      console.error("Fehler beim Aktualisieren des Einladungsstatus:", updateError);
      // Nicht werfen, da die E-Mail bereits erfolgreich gesendet wurde
    } else {
      console.log("Invitation status updated successfully:", updateData);
    }
    
    console.log("=== ADMIN INVITATION SERVICE SUCCESS ===");
    return data || { success: true, message: "E-Mail erfolgreich gesendet" };
  } catch (error: any) {
    console.error("=== ADMIN INVITATION SERVICE ERROR ===");
    console.error("Error details:", error);
    throw error;
  }
};

/**
 * Updates the administrator invitation status in the database
 */
export const updateInvitationStatusService = async (
  email: string,
  companyId: string
) => {
  try {
    console.log("Updating invitation status for:", email, "company:", companyId);
    
    // Validiere Eingaben
    if (!email || !companyId) {
      throw new Error("E-Mail und Firmen-ID sind erforderlich");
    }
    
    const { data, error } = await supabase.rpc(
      'update_admin_invitation',
      { 
        p_email: email.trim().toLowerCase(),
        p_company_id: companyId
      }
    );
    
    if (error) {
      console.error("Fehler beim Aktualisieren des Einladungsstatus:", error);
      throw new Error("Fehler beim Aktualisieren des Einladungsstatus: " + error.message);
    }
    
    console.log("Invitation status updated successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Fehler in updateInvitationStatusService:", error);
    throw error;
  }
};
