import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './audit-logger';

export interface SessionInfo {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

/**
 * Sicherer Session-Manager mit erweiterten Sicherheitsfunktionen
 */
export class SecureSessionManager {
  private static instance: SecureSessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 Stunden
  private readonly ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 Minuten

  private constructor() {
    this.startSessionMonitoring();
  }

  public static getInstance(): SecureSessionManager {
    if (!SecureSessionManager.instance) {
      SecureSessionManager.instance = new SecureSessionManager();
    }
    return SecureSessionManager.instance;
  }

  /**
   * Erstellt eine neue sichere Session
   */
  public async createSession(): Promise<string | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return null;

      const sessionToken = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          ip_address: null, // Wird server-seitig ermittelt
          user_agent: navigator.userAgent,
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Fehler beim Erstellen der Session:', error);
        return null;
      }

      await logSecurityEvent({
        action: 'session_created',
        resourceType: 'user_session',
        resourceId: data.id,
        success: true,
        details: {
          session_token: sessionToken.substring(0, 8) + '...',
          expires_at: expiresAt.toISOString()
        }
      });

      return sessionToken;
    } catch (error) {
      console.error('Fehler beim Erstellen der Session:', error);
      return null;
    }
  }

  /**
   * Aktualisiert die Session-Aktivität
   */
  public async updateActivity(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken)
        .eq('is_active', true);

      if (error) {
        console.error('Fehler beim Aktualisieren der Session-Aktivität:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Session-Aktivität:', error);
      return false;
    }
  }

  /**
   * Invalidiert eine Session
   */
  public async invalidateSession(sessionToken: string, reason: string = 'User logout'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          invalidated_at: new Date().toISOString(),
          invalidated_reason: reason
        })
        .eq('session_token', sessionToken)
        .select('id')
        .single();

      if (error) {
        console.error('Fehler beim Invalidieren der Session:', error);
        return false;
      }

      await logSecurityEvent({
        action: 'session_invalidated',
        resourceType: 'user_session',
        resourceId: data.id,
        success: true,
        details: {
          reason,
          session_token: sessionToken.substring(0, 8) + '...'
        }
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Invalidieren der Session:', error);
      return false;
    }
  }

  /**
   * Invalidiert alle Sessions eines Benutzers
   */
  public async invalidateAllUserSessions(userId: string, reason: string = 'Security action'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          invalidated_at: new Date().toISOString(),
          invalidated_reason: reason
        })
        .eq('user_id', userId)
        .eq('is_active', true)
        .select('id');

      if (error) {
        console.error('Fehler beim Invalidieren aller Sessions:', error);
        return false;
      }

      await logSecurityEvent({
        action: 'all_sessions_invalidated',
        resourceType: 'user_session',
        resourceId: userId,
        success: true,
        details: {
          reason,
          invalidated_count: data.length
        },
        riskLevel: 'high'
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Invalidieren aller Sessions:', error);
      return false;
    }
  }

  /**
   * Lädt aktive Sessions für einen Benutzer
   */
  public async getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der aktiven Sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der aktiven Sessions:', error);
      return [];
    }
  }

  /**
   * Bereinigt abgelaufene Sessions
   */
  public async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          invalidated_at: new Date().toISOString(),
          invalidated_reason: 'Session expired'
        })
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('Fehler beim Bereinigen abgelaufener Sessions:', error);
        return 0;
      }

      const cleanedCount = data.length;
      
      if (cleanedCount > 0) {
        await logSecurityEvent({
          action: 'expired_sessions_cleaned',
          resourceType: 'user_session',
          success: true,
          details: {
            cleaned_count: cleanedCount
          }
        });
      }

      return cleanedCount;
    } catch (error) {
      console.error('Fehler beim Bereinigen abgelaufener Sessions:', error);
      return 0;
    }
  }

  /**
   * Startet kontinuierliche Session-Überwachung
   */
  private startSessionMonitoring(): void {
    // Bereinige abgelaufene Sessions alle 5 Minuten
    this.sessionCheckInterval = setInterval(async () => {
      await this.cleanupExpiredSessions();
    }, this.ACTIVITY_UPDATE_INTERVAL);

    // Bereinige bei Seitenentladung
    window.addEventListener('beforeunload', () => {
      this.stopSessionMonitoring();
    });
  }

  /**
   * Stoppt die Session-Überwachung
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Generiert einen sicheren Session-Token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Globale Session-Manager-Instanz
 */
export const sessionManager = SecureSessionManager.getInstance();