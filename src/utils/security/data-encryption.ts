/**
 * Datenversch-lüsselung und -schutz für sensible Informationen
 */

// Client-seitige Verschlüsselung für lokale Daten
export class DataEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  /**
   * Erzeugt einen Verschlüsselungsschlüssel aus einem Passwort
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer.slice(0) as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Verschlüsselt sensible Daten vor der lokalen Speicherung
   */
  public static async encryptData(data: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      const key = await this.deriveKey(password, salt);
      const encodedData = encoder.encode(data);

      const encryptedData = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv: iv },
        key,
        encodedData
      );

      // Kombiniere Salt, IV und verschlüsselte Daten
      const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

      // Konvertiere zu Base64 für Speicherung
      return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (error) {
      console.error('Verschlüsselungsfehler:', error);
      throw new Error('Daten konnten nicht verschlüsselt werden');
    }
  }

  /**
   * Entschlüsselt zuvor verschlüsselte Daten
   */
  public static async decryptData(encryptedData: string, password: string): Promise<string> {
    try {
      // Konvertiere von Base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Extrahiere Salt, IV und verschlüsselte Daten
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 16 + this.IV_LENGTH);
      const encrypted = combined.slice(16 + this.IV_LENGTH);

      const key = await this.deriveKey(password, salt);

      const decryptedData = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv: iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Entschlüsselungsfehler:', error);
      throw new Error('Daten konnten nicht entschlüsselt werden');
    }
  }

  /**
   * Erstellt einen sicheren Hash für Passwörter (client-seitig nur für Vergleiche)
   */
  public static async hashData(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Hash-Fehler:', error);
      throw new Error('Daten konnten nicht gehasht werden');
    }
  }
}

/**
 * Sichere Speicherung für sensible lokale Daten
 */
export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'secure_storage_key';
  
  /**
   * Speichert verschlüsselte Daten im localStorage
   */
  public static async setSecureItem(key: string, value: string, password?: string): Promise<void> {
    try {
      const encryptionPassword = password || this.ENCRYPTION_KEY;
      const encryptedValue = await DataEncryption.encryptData(value, encryptionPassword);
      localStorage.setItem(`secure_${key}`, encryptedValue);
    } catch (error) {
      console.error('Fehler beim sicheren Speichern:', error);
      throw new Error('Daten konnten nicht sicher gespeichert werden');
    }
  }

  /**
   * Liest und entschlüsselt Daten aus dem localStorage
   */
  public static async getSecureItem(key: string, password?: string): Promise<string | null> {
    try {
      const encryptedValue = localStorage.getItem(`secure_${key}`);
      if (!encryptedValue) return null;

      const encryptionPassword = password || this.ENCRYPTION_KEY;
      return await DataEncryption.decryptData(encryptedValue, encryptionPassword);
    } catch (error) {
      console.error('Fehler beim sicheren Lesen:', error);
      return null;
    }
  }

  /**
   * Entfernt verschlüsselte Daten aus dem localStorage
   */
  public static removeSecureItem(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }

  /**
   * Löscht alle sicheren Daten
   */
  public static clearSecureStorage(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Sichere Datenübertragung Utilities
 */
export class SecureTransfer {
  /**
   * Bereitet sensible Daten für die sichere Übertragung vor
   */
  public static sanitizeForTransfer(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    // Entferne oder maskiere sensible Felder
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Entferne mögliche Script-Tags
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    });

    return sanitized;
  }

  /**
   * Validiert Datenintegrität nach Übertragung
   */
  public static async validateDataIntegrity(data: string, expectedHash: string): Promise<boolean> {
    try {
      const actualHash = await DataEncryption.hashData(data);
      return actualHash === expectedHash;
    } catch (error) {
      console.error('Fehler bei der Integritätsprüfung:', error);
      return false;
    }
  }
}

/**
 * Persönliche Daten (PII) Schutz
 */
export class PIIProtection {
  private static readonly PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    iban: /\b[A-Z]{2}\d{2}[\s]?[\d]{4}[\s]?[\d]{4}[\s]?[\d]{4}[\s]?[\d]{4}[\s]?[\d]{0,2}\b/g
  };

  /**
   * Erkennt PII in Textdaten
   */
  public static detectPII(text: string): { type: string; matches: string[] }[] {
    const detected: { type: string; matches: string[] }[] = [];

    Object.entries(this.PII_PATTERNS).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        detected.push({ type, matches });
      }
    });

    return detected;
  }

  /**
   * Maskiert PII in Textdaten
   */
  public static maskPII(text: string): string {
    let maskedText = text;

    Object.entries(this.PII_PATTERNS).forEach(([, pattern]) => {
      maskedText = maskedText.replace(pattern, (match) => {
        // Zeige nur die ersten und letzten Zeichen, maskiere den Rest
        if (match.length <= 4) return '*'.repeat(match.length);
        return match.substring(0, 2) + '*'.repeat(match.length - 4) + match.substring(match.length - 2);
      });
    });

    return maskedText;
  }

  /**
   * Entfernt PII aus Textdaten
   */
  public static removePII(text: string): string {
    let cleanedText = text;

    Object.entries(this.PII_PATTERNS).forEach(([, pattern]) => {
      cleanedText = cleanedText.replace(pattern, '[PII_REMOVED]');
    });

    return cleanedText;
  }
}

// Export für einfache Verwendung
export const {
  encryptData,
  decryptData,
  hashData
} = DataEncryption;

export const {
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  clearSecureStorage
} = SecureStorage;