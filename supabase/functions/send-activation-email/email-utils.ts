
import { EmailResponse } from "../_shared/types.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Analysiert Fehler beim E-Mail-Versand und liefert benutzerfreundliche Meldungen
 */
export function analyzeEmailError(error: any): { message: string, statusCode: number } {
  // Standardwerte
  let errorMessage = error.message || 'Unbekannter Fehler beim Senden der E-Mail';
  let statusCode = 500;
  
  console.log("Analysiere E-Mail-Fehler:", JSON.stringify(error));
  
  // Spezifische Resend API-Fehler mit hilfreicheren Meldungen analysieren
  if (error.statusCode === 429 || (errorMessage && errorMessage.includes('rate limit'))) {
    errorMessage = 'Zu viele Anfragen an den Resend-Service. Bitte warten Sie einige Minuten, bevor Sie es erneut versuchen.';
    statusCode = 429;
  } else if (error.statusCode === 401 || 
            (errorMessage && (errorMessage.includes('api key') || 
                            errorMessage.includes('authenticate') || 
                            errorMessage.includes('unauthorized')))) {
    errorMessage = 'Der Resend API-Schlüssel ist ungültig. Bitte generieren Sie einen neuen Schlüssel unter https://resend.com/api-keys.';
    statusCode = 401;
  } else if (error.statusCode === 403 || 
            (errorMessage && (errorMessage.includes('domain') || 
                            errorMessage.includes('from address') ||
                            errorMessage.includes('sender')))) {
    errorMessage = 'Die Absender-E-Mail-Adresse ist nicht verifiziert. Bitte verwenden Sie onboarding@resend.dev als Absender.';
    statusCode = 403;  
  }
  
  return { message: errorMessage, statusCode };
}

/**
 * Erzeugt eine erfolgreiche Antwort für den E-Mail-Versand
 */
export function createSuccessResponse(emailHTML: string): Response {
  const response: EmailResponse = {
    success: true, 
    message: "Einladung erfolgreich versendet",
    emailHTML: emailHTML.substring(0, 100) + "..." // Nur Vorschau
  };
  
  return new Response(
    JSON.stringify(response),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  );
}

/**
 * Bereitet die E-Mail-Daten für den Versand vor
 */
export function prepareEmailData(email: string, subject: string, htmlContent: string, plainText: string) {
  const fromEmail = 'onboarding@resend.dev';
  
  return {
    from: `MINUTE <${fromEmail}>`,
    to: [email],
    subject: subject,
    html: htmlContent,
    text: plainText,
    headers: {
      "X-Entity-Ref-ID": crypto.randomUUID()
    }
  };
}
