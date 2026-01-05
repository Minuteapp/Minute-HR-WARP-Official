import { z } from 'zod';

/**
 * IBAN Validierung nach ISO 13616
 * Prüft Format und Checksumme
 */
export const validateIBAN = (iban: string): { valid: boolean; error?: string } => {
  // Entferne Leerzeichen und konvertiere zu Großbuchstaben
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // Prüfe Länge (zwischen 15 und 34 Zeichen)
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return { valid: false, error: 'IBAN muss zwischen 15 und 34 Zeichen lang sein' };
  }
  
  // Prüfe Format (2 Buchstaben + 2 Ziffern + alphanumerisch)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
  if (!ibanRegex.test(cleanIBAN)) {
    return { valid: false, error: 'Ungültiges IBAN-Format (z.B. DE89370400440532013000)' };
  }
  
  // Länderspezifische Längenkontrolle (Beispiele)
  const countryLengths: Record<string, number> = {
    'DE': 22, 'AT': 20, 'CH': 21, 'FR': 27, 'GB': 22, 'IT': 27,
    'ES': 24, 'NL': 18, 'BE': 16, 'LU': 20, 'PT': 25
  };
  
  const countryCode = cleanIBAN.substring(0, 2);
  const expectedLength = countryLengths[countryCode];
  
  if (expectedLength && cleanIBAN.length !== expectedLength) {
    return { valid: false, error: `IBAN für ${countryCode} muss ${expectedLength} Zeichen haben` };
  }
  
  // Mod-97 Prüfsummenvalidierung
  const rearranged = cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);
  const numericString = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    // A=10, B=11, ..., Z=35
    return code >= 65 && code <= 90 ? (code - 55).toString() : char;
  }).join('');
  
  // Berechne Modulo 97
  let remainder = numericString.slice(0, 9);
  for (let offset = 9; offset < numericString.length; offset += 7) {
    const block = remainder + numericString.slice(offset, offset + 7);
    remainder = (parseInt(block, 10) % 97).toString();
  }
  
  if (parseInt(remainder, 10) !== 1) {
    return { valid: false, error: 'Ungültige IBAN-Prüfsumme' };
  }
  
  return { valid: true };
};

/**
 * BIC/SWIFT Validierung nach ISO 9362
 */
export const validateBIC = (bic: string): { valid: boolean; error?: string } => {
  const cleanBIC = bic.replace(/\s/g, '').toUpperCase();
  
  // BIC muss 8 oder 11 Zeichen haben
  if (cleanBIC.length !== 8 && cleanBIC.length !== 11) {
    return { valid: false, error: 'BIC muss 8 oder 11 Zeichen haben' };
  }
  
  // Format: 4 Buchstaben (Bank) + 2 Buchstaben (Land) + 2 alphanumerisch (Ort) + optional 3 alphanumerisch (Filiale)
  const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  if (!bicRegex.test(cleanBIC)) {
    return { valid: false, error: 'Ungültiges BIC-Format (z.B. COBADEFFXXX)' };
  }
  
  return { valid: true };
};

/**
 * Zod Schema für Bankdaten
 */
export const bankDetailsSchema = z.object({
  iban: z.string()
    .min(1, 'IBAN ist erforderlich')
    .refine((val) => validateIBAN(val).valid, (val) => ({
      message: validateIBAN(val).error || 'Ungültige IBAN'
    })),
  bic: z.string()
    .min(1, 'BIC ist erforderlich')
    .refine((val) => validateBIC(val).valid, (val) => ({
      message: validateBIC(val).error || 'Ungültige BIC'
    })),
  bankName: z.string().min(1, 'Bankname ist erforderlich')
});

/**
 * Formatiert IBAN mit Leerzeichen für bessere Lesbarkeit
 */
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Maskiert IBAN für Anzeige (zeigt nur letzte 4 Zeichen)
 */
export const maskIBAN = (iban: string): string => {
  if (!iban) return '';
  const cleaned = iban.replace(/\s/g, '');
  const visible = cleaned.slice(-4);
  const countryCode = cleaned.substring(0, 2);
  return `${countryCode}** **** **** **${visible}`;
};

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;
