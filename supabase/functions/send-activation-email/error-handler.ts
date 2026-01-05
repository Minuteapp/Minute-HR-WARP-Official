
import { corsHeaders } from "../_shared/cors.ts";
import { EmailResponse } from "../_shared/types.ts";

/**
 * Creates a standardized error response
 */
export function createErrorResponse(message: string, status: number): Response {
  // Create a more user-friendly message based on common errors
  let userFriendlyMessage = message;
  
  if (message.includes("You can only send testing emails to your own email address")) {
    userFriendlyMessage = "E-Mail-Domain nicht verifiziert. Bitte verifizieren Sie Ihre Domain bei Resend, um E-Mails an andere Adressen senden zu können.";
    console.error("Resend domain verification error:", message);
  } else if (message.includes("validate") || message.includes("validation")) {
    userFriendlyMessage = "Validierungsfehler: Die eingegebenen Daten sind ungültig.";
  }
  
  const response: EmailResponse = { 
    success: false,
    error: userFriendlyMessage,
    statusCode: status,
    message: userFriendlyMessage
  };
  
  console.error(`Returning error response (${status}):`, userFriendlyMessage);
  
  return new Response(
    JSON.stringify(response),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status
    }
  );
}
