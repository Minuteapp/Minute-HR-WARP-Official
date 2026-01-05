import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, logLoginAttempt } from './audit-logger';
import { validateStringLength, isValidEmail } from './input-validation';

/**
 * Sichere Login-Rate-Limiting
 */
export const checkLoginRateLimit = async (email: string, ipAddress?: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Letzte 15 Minuten
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Rate limit check failed:', error);
      return true; // Im Zweifel erlauben
    }

    // Prüfe auf zu viele fehlgeschlagene Versuche
    const failedAttempts = data?.filter(attempt => !attempt.success) || [];
    const blockedEntry = data?.find(attempt => 
      attempt.blocked_until && new Date(attempt.blocked_until) > new Date()
    );

    if (blockedEntry) {
      return false; // Blockiert
    }

    // Rate Limiting: Max 5 fehlgeschlagene Versuche in 15 Minuten
    if (failedAttempts.length >= 5) {
      // Erstelle Blockierung für 30 Minuten
      await supabase
        .from('login_attempts')
        .insert({
          email,
          ip_address: ipAddress,
          success: false,
          blocked_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          user_agent: navigator.userAgent
        });

      await logSecurityEvent({
        action: 'rate_limit_triggered',
        resourceType: 'auth',
        resourceId: email,
        success: false,
        riskLevel: 'high',
        details: { 
          email, 
          failedAttempts: failedAttempts.length,
          ipAddress 
        }
      });

      return false;
    }

    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Im Zweifel erlauben
  }
};

/**
 * Protokolliert Login-Versuch
 */
export const logLoginAttemptSecure = async (
  email: string, 
  success: boolean, 
  error?: string,
  ipAddress?: string
): Promise<void> => {
  try {
    // Supabase Login-Attempt protokollieren
    await supabase
      .from('login_attempts')
      .insert({
        email: validateEmail(email) ? email : 'invalid_email',
        success,
        ip_address: ipAddress,
        user_agent: navigator.userAgent
      });

    // Zusätzliches Security-Event-Logging
    await logLoginAttempt(email, success, error);
  } catch (error) {
    console.error('Login attempt logging failed:', error);
  }
};

/**
 * Validiert E-Mail sicher
 */
export const validateEmail = (email: string): boolean => {
  return isValidEmail(email) && validateStringLength(email, 1, 254);
};

/**
 * Validiert Passwort gegen Richtlinien
 */
export const validatePasswordPolicy = async (password: string): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  try {
    // Hole aktuelle Passwort-Richtlinien
    const { data: policy, error } = await supabase
      .from('password_policies')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !policy) {
      // Fallback auf Standard-Validierung
      return validatePasswordStrength(password);
    }

    const errors: string[] = [];

    if (password.length < policy.min_length) {
      errors.push(`Passwort muss mindestens ${policy.min_length} Zeichen lang sein`);
    }

    if (policy.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }

    if (policy.require_lowercase && !/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }

    if (policy.require_numbers && !/\d/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }

    if (policy.require_special_chars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Password policy validation failed:', error);
    return validatePasswordStrength(password);
  }
};

/**
 * Standard Passwort-Stärke-Validierung (Fallback)
 */
const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Passwort muss mindestens 8 Zeichen lang sein');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Passwort muss mindestens eine Zahl enthalten');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sichere Session-Validierung
 */
export const validateSession = async (sessionToken: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return false;
    }

    // Aktualisiere letzte Aktivität
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', data.id);

    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

/**
 * Session revozieren
 */
export const revokeSession = async (sessionToken: string, revokedBy?: string): Promise<void> => {
  try {
    await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy
      })
      .eq('session_token', sessionToken);

    await logSecurityEvent({
      action: 'session_revoked',
      resourceType: 'session',
      resourceId: sessionToken,
      success: true,
      details: { revokedBy }
    });
  } catch (error) {
    console.error('Session revocation failed:', error);
  }
};

/**
 * IP-Adresse aus Request extrahieren (Client-Side)
 */
export const getClientIP = (): string | undefined => {
  // Nur ein Fallback für Client-Side, echte IP sollte server-side ermittelt werden
  return undefined; // Browser kann echte IP nicht zuverlässig ermitteln
};