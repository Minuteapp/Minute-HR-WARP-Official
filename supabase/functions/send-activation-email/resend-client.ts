
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createErrorResponse } from "./error-handler.ts";

/**
 * Initialisiert und validiert den Resend-API-Client
 */
export function createResendClient(apiKey: string): { resend: Resend | null, error: string | null } {
  // Überprüfung des API-Schlüssels
  if (!apiKey || apiKey.length < 10) {
    console.error("Ungültiger Resend API-Schlüssel:", apiKey?.substring(0, 4) || "leer");
    return { 
      resend: null, 
      error: 'Ungültiger Resend API-Schlüssel. Bitte konfigurieren Sie einen gültigen Schlüssel in den Edge Function Secrets.' 
    };
  }
  
  // Validierung des API-Schlüsselformats
  if (!apiKey.startsWith('re_') && !apiKey.startsWith('TEST_')) {
    console.error("API-Schlüssel hat nicht das erwartete Format");
    return {
      resend: null,
      error: 'Der API-Schlüssel hat nicht das richtige Format. Echte API-Schlüssel beginnen mit "re_".'
    };
  }
  
  // Warnung für Test-API-Schlüssel
  if (apiKey.startsWith('TEST_')) {
    console.warn("WARNUNG: Sie verwenden einen Test-API-Schlüssel. Diese sind nur für Testzwecke gedacht.");
  }
  
  // Resend-Client mit API-Schlüssel erstellen
  const resend = new Resend(apiKey);
  return { resend, error: null };
}

/**
 * Testet die Verbindung zur Resend API durch grundlegende Validierung
 */
export async function testResendApiConnection(apiKey: string): Promise<{ isValid: boolean, error?: string }> {
  try {
    console.log("Validiere Resend API-Schlüssel");
    
    // Überprüfung des API-Schlüssels 
    if (!apiKey || apiKey.length < 10) {
      console.error("Ungültiges Resend API-Schlüsselformat:", apiKey?.substring(0, 4) || "leer");
      return { isValid: false, error: "API-Schlüssel zu kurz oder fehlt" };
    }
    
    // Einfache Validierung des Formats
    if (!apiKey.startsWith('re_') && !apiKey.startsWith('TEST_')) {
      console.error("API-Schlüssel hat nicht das erwartete Format");
      return { 
        isValid: false, 
        error: 'Der API-Schlüssel hat nicht das richtige Format. Echte API-Schlüssel beginnen mit "re_".'
      };
    }
    
    console.log("API-Schlüssel hat das richtige Format, betrachte als gültig");
    return { isValid: true };
    
  } catch (error: any) {
    console.error("API-Verbindungstestfehler (kritisch):", error);
    return { 
      isValid: false, 
      error: `Verbindungsfehler: ${error.message || 'Unbekannter Fehler'}` 
    };
  }
}
