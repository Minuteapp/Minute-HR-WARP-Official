import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { securityMonitor, monitorInput, checkRateLimit } from '@/utils/security/security-monitor';
import { logSecurityEvent } from '@/utils/security/audit-logger';
import { validatePasswordStrength, isValidEmail } from '@/utils/security/input-validation';
import { PIIProtection } from '@/utils/security/data-encryption';

interface SecurityState {
  isSecure: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastSecurityCheck: Date | null;
  activeThreats: number;
  rateLimitExceeded: boolean;
}

interface SecurityManagerOptions {
  enableRealTimeMonitoring?: boolean;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
  autoLogSuspiciousActivity?: boolean;
}

/**
 * Hook für umfassende Sicherheitsverwaltung
 */
export const useSecurityManager = (options: SecurityManagerOptions = {}) => {
  const { user, isAuthenticated } = useAuth();
  const [securityState, setSecurityState] = useState<SecurityState>({
    isSecure: true,
    threatLevel: 'low',
    lastSecurityCheck: null,
    activeThreats: 0,
    rateLimitExceeded: false
  });

  const {
    enableRealTimeMonitoring = true,
    rateLimitRequests = 100,
    rateLimitWindow = 60000,
    autoLogSuspiciousActivity = true
  } = options;

  /**
   * Überwacht Benutzereingaben auf Sicherheitsbedrohungen
   */
  const validateInput = useCallback(async (input: string, context: string = 'user_input') => {
    try {
      // PII Erkennung
      const piiDetected = PIIProtection.detectPII(input);
      if (piiDetected.length > 0 && autoLogSuspiciousActivity) {
        await logSecurityEvent({
          action: 'pii_detected',
          resourceType: 'user_input',
          success: true,
          details: {
            context,
            piiTypes: piiDetected.map(p => p.type),
            timestamp: new Date().toISOString()
          }
        });
      }

      // Sicherheitsüberwachung
      if (enableRealTimeMonitoring) {
        await monitorInput(input, context);
      }

      return {
        isValid: true,
        hasPII: piiDetected.length > 0,
        piiTypes: piiDetected.map(p => p.type),
        maskedInput: PIIProtection.maskPII(input)
      };
    } catch (error) {
      console.error('Fehler bei der Eingabevalidierung:', error);
      return {
        isValid: false,
        hasPII: false,
        piiTypes: [],
        maskedInput: input
      };
    }
  }, [enableRealTimeMonitoring, autoLogSuspiciousActivity]);

  /**
   * Prüft Rate Limits für Benutzeraktionen
   */
  const checkActionRateLimit = useCallback((actionType: string = 'general') => {
    const identifier = user?.id || 'anonymous';
    const isAllowed = checkRateLimit(`${identifier}_${actionType}`, rateLimitRequests, rateLimitWindow);
    
    if (!isAllowed) {
      setSecurityState(prev => ({
        ...prev,
        rateLimitExceeded: true,
        threatLevel: prev.threatLevel === 'low' ? 'medium' : prev.threatLevel
      }));
    }

    return isAllowed;
  }, [user?.id, rateLimitRequests, rateLimitWindow]);

  /**
   * Validiert Passwort-Sicherheit
   */
  const validatePassword = useCallback((password: string) => {
    const validation = validatePasswordStrength(password);
    
    if (!validation.isValid && autoLogSuspiciousActivity) {
      logSecurityEvent({
        action: 'weak_password_attempt',
        resourceType: 'authentication',
        success: false,
        details: {
          errors: validation.errors,
          timestamp: new Date().toISOString()
        }
      });
    }

    return validation;
  }, [autoLogSuspiciousActivity]);

  /**
   * Validiert E-Mail-Adressen
   */
  const validateEmail = useCallback((email: string) => {
    const isValid = isValidEmail(email);
    
    if (!isValid && autoLogSuspiciousActivity) {
      logSecurityEvent({
        action: 'invalid_email_attempt',
        resourceType: 'authentication',
        success: false,
        details: {
          email: email.substring(0, 10) + '***', // Teilweise maskiert
          timestamp: new Date().toISOString()
        }
      });
    }

    return isValid;
  }, [autoLogSuspiciousActivity]);

  /**
   * Führt eine umfassende Sicherheitsprüfung durch
   */
  const performSecurityCheck = useCallback(async () => {
    try {
      let threatLevel: SecurityState['threatLevel'] = 'low';
      let activeThreats = 0;

      // Prüfe Authentifizierungsstatus
      if (!isAuthenticated) {
        threatLevel = 'medium';
        activeThreats++;
      }

      // Prüfe Browser-Sicherheitsfeatures
      const hasSecureContext = window.isSecureContext;
      if (!hasSecureContext) {
        threatLevel = 'high';
        activeThreats++;
      }

      // Prüfe auf verdächtige Browser-Umgebung
      const userAgent = navigator.userAgent;
      const suspiciousPatterns = [
        /PhantomJS/i,
        /HeadlessChrome/i,
        /Selenium/i,
        /webdriver/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        threatLevel = 'high';
        activeThreats++;
        
        if (autoLogSuspiciousActivity) {
          await logSecurityEvent({
            action: 'suspicious_browser_detected',
            resourceType: 'browser_security',
            success: false,
            details: {
              userAgent,
              timestamp: new Date().toISOString()
            }
          });
        }
      }

      setSecurityState(prev => ({
        ...prev,
        threatLevel,
        activeThreats,
        lastSecurityCheck: new Date(),
        isSecure: threatLevel === 'low'
      }));

      return { threatLevel, activeThreats, isSecure: threatLevel === 'low' };
    } catch (error) {
      console.error('Fehler bei der Sicherheitsprüfung:', error);
      setSecurityState(prev => ({
        ...prev,
        threatLevel: 'medium',
        isSecure: false,
        lastSecurityCheck: new Date()
      }));
      return { threatLevel: 'medium' as const, activeThreats: 1, isSecure: false };
    }
  }, [isAuthenticated, autoLogSuspiciousActivity]);

  /**
   * Protokolliert sicherheitsrelevante Benutzeraktionen
   */
  const logUserAction = useCallback(async (action: string, details: Record<string, any> = {}) => {
    if (!autoLogSuspiciousActivity) return;

    try {
      await logSecurityEvent({
        action: `user_${action}`,
        resourceType: 'user_action',
        success: true,
        details: {
          ...details,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          securityState: securityState.threatLevel
        }
      });
    } catch (error) {
      console.error('Fehler beim Protokollieren der Benutzeraktion:', error);
    }
  }, [user?.id, securityState.threatLevel, autoLogSuspiciousActivity]);

  /**
   * Setzt Rate Limit Status zurück
   */
  const resetRateLimit = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      rateLimitExceeded: false
    }));
  }, []);

  /**
   * Automatische Sicherheitsprüfungen
   */
  useEffect(() => {
    if (enableRealTimeMonitoring) {
      performSecurityCheck();
      
      // Regelmäßige Sicherheitsprüfungen alle 5 Minuten
      const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [enableRealTimeMonitoring, performSecurityCheck]);

  /**
   * Überwachung von Browser-Events für Sicherheit
   */
  useEffect(() => {
    if (!enableRealTimeMonitoring) return;

    const handleVisibilityChange = () => {
      if (document.hidden && autoLogSuspiciousActivity) {
        logUserAction('page_hidden', { timestamp: new Date().toISOString() });
      }
    };

    const handleBeforeUnload = () => {
      if (autoLogSuspiciousActivity) {
        logUserAction('page_unload', { timestamp: new Date().toISOString() });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableRealTimeMonitoring, autoLogSuspiciousActivity, logUserAction]);

  return {
    // Zustand
    securityState,
    
    // Validierungsfunktionen
    validateInput,
    validatePassword,
    validateEmail,
    
    // Rate Limiting
    checkActionRateLimit,
    resetRateLimit,
    
    // Sicherheitsprüfungen
    performSecurityCheck,
    
    // Protokollierung
    logUserAction,
    
    // Utilities
    isSecure: securityState.isSecure,
    threatLevel: securityState.threatLevel,
    canPerformAction: !securityState.rateLimitExceeded
  };
};