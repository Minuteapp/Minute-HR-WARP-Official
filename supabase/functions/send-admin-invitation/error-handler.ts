
import { corsHeaders } from "../_shared/cors.ts";

export const createErrorResponse = (message: string, status: number = 500) => {
  console.error(`Error response (${status}):`, message);
  
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

export const handleCommonErrors = (error: any) => {
  console.error("Unerwarteter Fehler:", error);
  
  let message = "Ein unerwarteter Fehler ist aufgetreten";
  let status = 500;

  if (error?.message) {
    message = error.message;
  }

  if (error?.status) {
    status = error.status;
  }

  return createErrorResponse(message, status);
};
