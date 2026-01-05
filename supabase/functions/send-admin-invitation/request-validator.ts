
import { corsHeaders } from "../_shared/cors.ts";

export interface AdminInvitationRequest {
  email: string;
  companyName: string;
  companyId: string;
  signUpLink?: string;
  role?: string;
}

export const validateRequest = async (req: Request): Promise<AdminInvitationRequest> => {
  // Überprüfe HTTP-Methode
  if (req.method !== 'POST') {
    throw new Error(`Methode ${req.method} wird nicht unterstützt. Nur POST ist erlaubt.`);
  }

  // Überprüfe Content-Type
  const contentType = req.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Content-Type muss application/json sein');
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Fehler beim Parsen des Request-Body:", error);
    throw new Error('Ungültiger JSON im Request-Body');
  }

  console.log("Request-Body empfangen:", JSON.stringify(body));

  // Validiere erforderliche Felder
  const { email, companyName, companyId, signUpLink, role } = body;

  if (!email) {
    throw new Error('E-Mail-Adresse ist erforderlich');
  }

  if (!companyName) {
    throw new Error('Firmenname ist erforderlich');
  }

  if (!companyId) {
    throw new Error('Firmen-ID ist erforderlich');
  }

  // UUID-Validierung für companyId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(companyId)) {
    throw new Error('Ungültige Firmen-ID Format');
  }

  return {
    email: email.trim().toLowerCase(),
    companyName: companyName.trim(),
    companyId: companyId.trim(),
    signUpLink,
    role: role || 'admin'
  };
};
