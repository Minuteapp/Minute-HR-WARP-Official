
/**
 * Validiert eine E-Mail-Adresse
 * @param email Die zu validierende E-Mail-Adresse
 * @returns Objekt mit Validierungsergebnis und Fehlernachricht
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email || email.trim() === '') {
    return { 
      isValid: false, 
      message: 'Bitte geben Sie eine E-Mail-Adresse ein.' 
    };
  }
  
  // Einfache Regex für E-Mail-Validierung
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
    };
  }
  
  return { isValid: true };
};
