/**
 * Sichere Authentifizierungs-Utilities
 * Implementiert verbesserte Sicherheitsmaßnahmen für Auth-Flows
 */

import { supabase } from '@/integrations/supabase/client';
import { isValidEmail, createRateLimiter } from './input-validation';

// Rate Limiter für Login-Versuche (max 5 Versuche pro 15 Minuten)
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

export interface SecureLoginResult {
  success: boolean;
  error?: string;
  requiresMFA?: boolean;
  user?: any;
  session?: any;
}

export interface SessionInfo {
  id: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
}

/**
 * Sichere Login-Funktion mit Rate Limiting und Audit Logging
 */
export const secureLogin = async (
  email: string,
  password: string,
  sessionInfo?: SessionInfo
): Promise<SecureLoginResult> => {
  try {
    // Input-Validierung
    if (!email || !password) {
      throw new Error('E-Mail und Passwort sind erforderlich');
    }

    if (!isValidEmail(email)) {
      throw new Error('Ungültige E-Mail-Adresse');
    }

    // Rate Limiting
    const clientId = sessionInfo?.ipAddress || 'unknown';
    if (!loginRateLimiter(clientId)) {
      await logLoginAttempt(email, false, 'Rate limit exceeded', sessionInfo);
      throw new Error('Zu viele Login-Versuche. Bitte versuchen Sie es später erneut.');
    }

    // Supabase Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await logLoginAttempt(email, false, error.message, sessionInfo);
      throw error;
    }

    if (!data.user || !data.session) {
      await logLoginAttempt(email, false, 'No user or session returned', sessionInfo);
      throw new Error('Login fehlgeschlagen');
    }

    // Erfolgreichen Login protokollieren
    await logLoginAttempt(email, true, 'Login successful', sessionInfo);

    // MFA-Status prüfen
    const mfaRequired = await checkMFARequired(data.user.id);

    // Session in Datenbank speichern
    if (sessionInfo) {
      await createUserSession(data.user.id, data.session.access_token, sessionInfo);
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      requiresMFA: mfaRequired,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login fehlgeschlagen',
    };
  }
};

/**
 * MFA-Status für Benutzer prüfen
 */
const checkMFARequired = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_mfa_settings')
      .select('mfa_enabled')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking MFA status:', error);
      return false;
    }

    return data?.mfa_enabled || false;
  } catch (error) {
    console.error('Error in checkMFARequired:', error);
    return false;
  }
};

/**
 * Login-Versuch protokollieren
 */
const logLoginAttempt = async (
  email: string,
  success: boolean,
  errorMessage?: string,
  sessionInfo?: SessionInfo
): Promise<void> => {
  try {
    await supabase.from('login_attempts').insert({
      email,
      ip_address: sessionInfo?.ipAddress || null,
      success,
      user_agent: sessionInfo?.userAgent || null,
      failure_reason: success ? null : errorMessage,
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    // Nicht kritisch - Login sollte trotzdem funktionieren
  }
};

/**
 * User Session in Datenbank erstellen
 */
const createUserSession = async (
  userId: string,
  sessionToken: string,
  sessionInfo: SessionInfo
): Promise<void> => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 Stunden Session

    await supabase.from('user_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      ip_address: sessionInfo.ipAddress,
      user_agent: sessionInfo.userAgent,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating user session:', error);
    // Nicht kritisch - Login sollte trotzdem funktionieren
  }
};

/**
 * Session validieren
 */
export const validateSession = async (sessionToken: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return false;
    }

    // Last activity aktualisieren
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', data.id);

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

/**
 * Session beenden
 */
export const revokeSession = async (sessionToken: string): Promise<void> => {
  try {
    await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_reason: 'User logout',
      })
      .eq('session_token', sessionToken);
  } catch (error) {
    console.error('Error revoking session:', error);
  }
};

/**
 * Alle Sessions eines Benutzers beenden (außer der aktuellen)
 */
export const revokeAllOtherSessions = async (
  userId: string,
  currentSessionToken: string
): Promise<void> => {
  try {
    await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_reason: 'User requested logout all other sessions',
      })
      .eq('user_id', userId)
      .neq('session_token', currentSessionToken)
      .eq('is_active', true);
  } catch (error) {
    console.error('Error revoking other sessions:', error);
  }
};

/**
 * Verdächtige Login-Aktivitäten erkennen
 */
export const detectSuspiciousLogin = async (
  email: string,
  sessionInfo: SessionInfo
): Promise<boolean> => {
  try {
    // Letzte erfolgreiche Logins für diesen Benutzer
    const { data: recentLogins } = await supabase
      .from('login_attempts')
      .select('ip_address, attempted_at')
      .eq('email', email)
      .eq('success', true)
      .order('attempted_at', { ascending: false })
      .limit(10);

    if (!recentLogins || recentLogins.length === 0) {
      return false; // Erster Login oder keine Historie
    }

    const currentIP = sessionInfo.ipAddress;
    const recentIPs = recentLogins.map(login => login.ip_address);

    // Prüfe auf neue IP-Adresse
    const isNewIP = !recentIPs.includes(currentIP);

    // Prüfe auf ungewöhnliche Timing-Muster
    const lastLogin = new Date(recentLogins[0].attempted_at);
    const timeSinceLastLogin = Date.now() - lastLogin.getTime();
    const isUnusualTiming = timeSinceLastLogin < 5 * 60 * 1000; // Weniger als 5 Minuten

    return isNewIP && isUnusualTiming;
  } catch (error) {
    console.error('Error detecting suspicious login:', error);
    return false;
  }
};

/**
 * IP-Whitelist prüfen (falls konfiguriert)
 */
export const isIPAllowed = async (userId: string, ipAddress: string): Promise<boolean> => {
  try {
    // Verwendung der bereits vorhandenen Datenbankfunktion
    const { data, error } = await supabase.rpc('is_ip_allowed', {
      p_user_id: userId,
      p_ip_address: ipAddress,
    });

    if (error) {
      console.error('Error checking IP allowlist:', error);
      return true; // Im Fehlerfall erlaube Login
    }

    return data;
  } catch (error) {
    console.error('Error in isIPAllowed:', error);
    return true; // Im Fehlerfall erlaube Login
  }
};