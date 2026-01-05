import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, logSuspiciousActivity } from './audit-logger';

interface SecurityThreat {
  type: 'brute_force' | 'sql_injection' | 'xss_attempt' | 'unauthorized_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, any>;
}

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Erweiterte Sicherheitsüberwachung für kritische Operationen
 */
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private threatDetectionRules: Map<string, (data: any) => boolean> = new Map();

  private constructor() {
    this.initializeThreatDetection();
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  private initializeThreatDetection() {
    // SQL Injection Erkennung
    this.threatDetectionRules.set('sql_injection', (input: string) => {
      const sqlPatterns = [
        /(\bUNION\b.*\bSELECT\b)/i,
        /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
        /(\bINSERT\b.*\bINTO\b)/i,
        /(\bDROP\b.*\bTABLE\b)/i,
        /(\bDELETE\b.*\bFROM\b)/i,
        /('.*OR.*'.*=.*')/i,
        /(--.*$)/m,
        /(\bEXEC\b.*\()/i
      ];
      return sqlPatterns.some(pattern => pattern.test(input));
    });

    // XSS Erkennung
    this.threatDetectionRules.set('xss_attempt', (input: string) => {
      const xssPatterns = [
        /<script.*?>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe.*?>/gi,
        /<object.*?>/gi,
        /<embed.*?>/gi,
        /eval\s*\(/gi,
        /document\.cookie/gi
      ];
      return xssPatterns.some(pattern => pattern.test(input));
    });

    // Brute Force Erkennung
    this.threatDetectionRules.set('brute_force', (attempts: number) => {
      return attempts > 5; // Mehr als 5 Versuche in kurzer Zeit
    });
  }

  /**
   * Überwacht und analysiert Benutzereingaben auf Sicherheitsbedrohungen
   */
  public async monitorInput(input: string, context: string): Promise<void> {
    try {
      // SQL Injection Check
      if (this.threatDetectionRules.get('sql_injection')?.(input)) {
        await this.handleThreat({
          type: 'sql_injection',
          severity: 'critical',
          source: context,
          details: { input: input.substring(0, 100), timestamp: new Date().toISOString() }
        });
      }

      // XSS Check
      if (this.threatDetectionRules.get('xss_attempt')?.(input)) {
        await this.handleThreat({
          type: 'xss_attempt',
          severity: 'high',
          source: context,
          details: { input: input.substring(0, 100), timestamp: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Fehler bei der Sicherheitsüberwachung:', error);
    }
  }

  /**
   * Rate Limiting für API-Endpunkte
   */
  public checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = rateLimitStore.get(identifier);

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      // Möglicher Brute Force Angriff
      this.handleThreat({
        type: 'brute_force',
        severity: 'high',
        source: 'rate_limiter',
        details: { identifier, attempts: userLimit.count, timestamp: new Date().toISOString() }
      });
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Überwacht Anmeldeversuche auf verdächtige Aktivitäten
   */
  public async monitorLoginAttempt(email: string, success: boolean, ipAddress?: string): Promise<void> {
    const identifier = `login_${email}_${ipAddress || 'unknown'}`;
    
    if (!success) {
      const attempts = this.getFailedAttempts(identifier) + 1;
      this.recordFailedAttempt(identifier);

      if (attempts >= 5) {
        await this.handleThreat({
          type: 'brute_force',
          severity: 'high',
          source: 'login_monitor',
          details: { 
            email, 
            ipAddress, 
            attempts, 
            timestamp: new Date().toISOString() 
          }
        });
      }
    } else {
      this.clearFailedAttempts(identifier);
    }
  }

  /**
   * Überwacht Dateizugriffe auf unberechtigte Versuche
   */
  public async monitorFileAccess(userId: string, resourceId: string, resourceType: string, allowed: boolean): Promise<void> {
    if (!allowed) {
      await this.handleThreat({
        type: 'unauthorized_access',
        severity: 'medium',
        source: 'file_access_monitor',
        details: {
          userId,
          resourceId,
          resourceType,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Behandelt erkannte Sicherheitsbedrohungen
   */
  private async handleThreat(threat: SecurityThreat): Promise<void> {
    try {
      // Protokolliere das Sicherheitsereignis
      await logSuspiciousActivity(threat.type, {
        severity: threat.severity,
        source: threat.source,
        details: threat.details,
        detectedAt: new Date().toISOString()
      });

      // Bei kritischen Bedrohungen sofortige Maßnahmen
      if (threat.severity === 'critical') {
        await this.triggerEmergencyResponse(threat);
      }

      // Speichere in der Datenbank für weitere Analyse
      await this.storeThreatInDatabase(threat);

    } catch (error) {
      console.error('Fehler beim Behandeln der Sicherheitsbedrohung:', error);
    }
  }

  /**
   * Notfallmaßnahmen bei kritischen Bedrohungen
   */
  private async triggerEmergencyResponse(threat: SecurityThreat): Promise<void> {
    // Temporäre Sperrung des Benutzers bei kritischen Bedrohungen
    if (threat.type === 'sql_injection' || threat.type === 'data_breach') {
      console.warn('KRITISCHE SICHERHEITSBEDROHUNG ERKANNT:', threat);
      
      // Hier könnten weitere Maßnahmen implementiert werden:
      // - Benutzer temporär sperren
      // - Admin-Benachrichtigungen senden
      // - Sicherheitsteam alarmieren
    }
  }

  /**
   * Speichert Bedrohungsdaten in der Datenbank für Analyse
   */
  private async storeThreatInDatabase(threat: SecurityThreat): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_threats')
        .insert({
          threat_type: threat.type,
          severity: threat.severity,
          source: threat.source,
          details: threat.details,
          detected_at: new Date().toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        console.error('Fehler beim Speichern der Bedrohungsdaten:', error);
      }
    } catch (error) {
      // Fehler beim Speichern sollten nicht die Sicherheitsüberwachung stoppen
      console.error('Datenbankfehler bei Bedrohungsspeicherung:', error);
    }
  }

  // Hilfsmethoden für Failed Attempts Tracking
  private getFailedAttempts(identifier: string): number {
    const limit = rateLimitStore.get(`failed_${identifier}`);
    return limit?.count || 0;
  }

  private recordFailedAttempt(identifier: string): void {
    const key = `failed_${identifier}`;
    const current = rateLimitStore.get(key);
    const now = Date.now();
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + 300000 }); // 5 Minuten
    } else {
      current.count++;
    }
  }

  private clearFailedAttempts(identifier: string): void {
    rateLimitStore.delete(`failed_${identifier}`);
  }
}

// Globale Instanz für einfachen Zugriff
export const securityMonitor = SecurityMonitor.getInstance();

// Wrapper-Funktionen für häufige Verwendung
export const monitorInput = (input: string, context: string) => 
  securityMonitor.monitorInput(input, context);

export const checkRateLimit = (identifier: string, maxRequests?: number, windowMs?: number) => 
  securityMonitor.checkRateLimit(identifier, maxRequests, windowMs);

export const monitorLoginAttempt = (email: string, success: boolean, ipAddress?: string) => 
  securityMonitor.monitorLoginAttempt(email, success, ipAddress);

export const monitorFileAccess = (userId: string, resourceId: string, resourceType: string, allowed: boolean) => 
  securityMonitor.monitorFileAccess(userId, resourceId, resourceType, allowed);