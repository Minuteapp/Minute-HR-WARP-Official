
/**
 * Enhanced email validation for admin invitations
 */
export interface EmailValidationResult {
  valid: boolean;
  message?: string;
}

export const validateEmail = (email: string): EmailValidationResult => {
  if (!email) {
    return { valid: false, message: "E-Mail-Adresse ist erforderlich" };
  }

  if (typeof email !== 'string') {
    return { valid: false, message: "E-Mail-Adresse muss ein String sein" };
  }

  // Entferne Leerzeichen
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, message: "E-Mail-Adresse darf nicht leer sein" };
  }

  // Einfache E-Mail-Validierung
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: "Ungültiges E-Mail-Format" };
  }

  // Längenvalidierung
  if (trimmedEmail.length > 254) {
    return { valid: false, message: "E-Mail-Adresse ist zu lang" };
  }

  return { valid: true };
};
