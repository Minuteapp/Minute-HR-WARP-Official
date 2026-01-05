/**
 * Zentrale E-Mail-Konfiguration für alle Edge Functions
 * 
 * ANLEITUNG ZUR PRODUKTIVSCHALTUNG:
 * 1. Domain bei Resend validieren: https://resend.com/domains
 * 2. FROM_EMAIL auf eigene Domain ändern (z.B. noreply@minute-hr.de)
 * 3. FROM_NAME nach Bedarf anpassen
 * 4. PRODUCTION_MODE auf true setzen
 */

// ============================================
// KONFIGURATION - HIER ÄNDERN FÜR PRODUKTION
// ============================================

// Produktionsmodus: Wenn true, werden E-Mails an alle Adressen gesendet
// Wenn false, nur an TEST_EMAILS erlaubt
export const PRODUCTION_MODE = true;

// Absender-E-Mail - WICHTIG: Domain muss bei Resend validiert sein!
// Validierung unter: https://resend.com/domains
export const FROM_EMAIL = "noreply@minute-hr.de";

// Absender-Name
export const FROM_NAME = "MINUTE";

// Vollständiger Absender-String
export const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

// Erlaubte Test-E-Mails (nur relevant wenn PRODUCTION_MODE = false)
export const TEST_EMAILS = [
  "minuteapp@outlook.de",
  // Weitere Test-E-Mails hier hinzufügen
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Prüft ob eine E-Mail-Adresse im aktuellen Modus erlaubt ist
 */
export function isEmailAllowed(email: string): boolean {
  if (PRODUCTION_MODE) {
    return true;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  return TEST_EMAILS.some(testEmail => testEmail.toLowerCase() === normalizedEmail);
}

/**
 * Gibt eine benutzerfreundliche Fehlermeldung zurück wenn E-Mail nicht erlaubt
 */
export function getEmailRestrictionMessage(email: string): string {
  if (isEmailAllowed(email)) {
    return "";
  }
  
  return `E-Mail-Versand im Testmodus nur an ${TEST_EMAILS.join(", ")} erlaubt. ` +
         `Für Produktivbetrieb: Domain bei Resend validieren und PRODUCTION_MODE aktivieren.`;
}

/**
 * Logging für E-Mail-Konfiguration
 */
export function logEmailConfig(): void {
  console.log("📧 E-Mail-Konfiguration:");
  console.log(`   Modus: ${PRODUCTION_MODE ? "PRODUKTION" : "TEST"}`);
  console.log(`   Absender: ${FROM_ADDRESS}`);
  if (!PRODUCTION_MODE) {
    console.log(`   Erlaubte Test-E-Mails: ${TEST_EMAILS.join(", ")}`);
  }
}
