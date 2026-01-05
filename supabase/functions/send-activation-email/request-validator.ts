
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Validates the request body for sending activation emails
 */
export async function validateInvitationRequest(request: Request) {
  try {
    // Prüfen ob es sich um einen OPTIONS-Request handelt
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Prüfen ob es sich um einen POST-Request handelt
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Nur POST-Anfragen sind erlaubt" 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validiere Request-Daten
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Fehler beim Parsen des JSON-Körpers:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Ungültiges JSON-Format" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { email, name, company, signUpLink, companyId, isAuthorizedEmail } = body;
    
    // Validiere E-Mail-Format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Ungültiges E-Mail-Format" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validiere Firma
    if (!company) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Firmenname fehlt" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validiere Registrierungslink
    if (!signUpLink) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Registrierungslink fehlt" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Wenn alle Validierungen bestanden wurden, geben wir die Daten zurück
    return { 
      email, 
      name: name || email.split('@')[0], // Fallback falls kein Name angegeben wurde
      company, 
      signUpLink,
      companyId,
      // Wenn isAuthorizedEmail nicht explizit gesendet wurde, prüfen wir selbst
      isAuthorizedEmail: isAuthorizedEmail !== undefined 
        ? isAuthorizedEmail 
        : email.toLowerCase() === "minuteapp@outlook.de"
    };
  } catch (error) {
    console.error("Error validating request:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Ungültiges Anforderungsformat" 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
