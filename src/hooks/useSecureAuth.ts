/**
 * Hook für sichere Authentifizierung mit erweiterten Sicherheitsfeatures
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  secureLogin, 
  validateSession, 
  revokeSession, 
  detectSuspiciousLogin,
  isIPAllowed,
  SecureLoginResult 
} from '@/utils/security/secure-auth';
import { useToast } from '@/components/ui/use-toast';
import { rateLimiter, RATE_LIMITS } from '@/utils/security/rate-limiter';

export const useSecureAuth = () => {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const { toast } = useToast();

  // Session-Validierung beim Mount
  useEffect(() => {
    if (session?.access_token) {
      validateCurrentSession();
    }
  }, [session]);

  const validateCurrentSession = async () => {
    if (!session?.access_token) return;

    try {
      const isValid = await validateSession(session.access_token);
      setSessionValid(isValid);
      
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Session ungültig",
          description: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an."
        });
      }
    } catch (error) {
      console.error('Session validation error:', error);
      setSessionValid(false);
    }
  };

  const handleSecureLogin = async (email: string, password: string): Promise<SecureLoginResult> => {
    setIsLoading(true);
    
    try {
      // Rate limiting check
      const { maxAttempts, windowMs } = RATE_LIMITS.LOGIN;
      if (!rateLimiter.isAllowed(email, maxAttempts, windowMs)) {
        const timeUntilReset = rateLimiter.getTimeUntilReset(email);
        const minutes = Math.ceil(timeUntilReset / 60000);
        
        toast({
          variant: "destructive",
          title: "Zu viele Anmeldeversuche",
          description: `Bitte warten Sie ${minutes} Minuten bevor Sie es erneut versuchen.`
        });
        
        return {
          success: false,
          error: 'Rate limit exceeded'
        };
      }

      // Session-Informationen sammeln
      const sessionInfo = {
        id: crypto.randomUUID(),
        userAgent: navigator.userAgent,
        ipAddress: await getClientIP(),
      };

      // Verdächtige Aktivität prüfen
      const isSuspicious = await detectSuspiciousLogin(email, sessionInfo);
      
      if (isSuspicious) {
        toast({
          variant: "destructive",
          title: "Verdächtige Aktivität",
          description: "Login von unbekannter IP-Adresse erkannt. Zusätzliche Sicherheitsprüfung erforderlich."
        });
      }

      const result = await secureLogin(email, password, sessionInfo);

      if (result.success) {
        // Clear rate limit on successful login
        rateLimiter.clear(email);
        
        // IP-Whitelist prüfen falls aktiviert
        if (result.user && sessionInfo.ipAddress) {
          const ipAllowed = await isIPAllowed(result.user.id, sessionInfo.ipAddress);
          
          if (!ipAllowed) {
            await revokeSession(result.session?.access_token);
            return {
              success: false,
              error: 'Login von dieser IP-Adresse nicht erlaubt'
            };
          }
        }

        if (result.requiresMFA) {
          toast({
            title: "MFA erforderlich",
            description: "Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein."
          });
        } else {
          toast({
            title: "Login erfolgreich",
            description: "Sie wurden erfolgreich angemeldet."
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login fehlgeschlagen",
          description: result.error || "Unbekannter Fehler"
        });
      }

      return result;
    } catch (error: any) {
      const errorResult = {
        success: false,
        error: error.message || 'Login fehlgeschlagen'
      };
      
      toast({
        variant: "destructive",
        title: "Login-Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      });
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecureLogout = async () => {
    if (session?.access_token) {
      await revokeSession(session.access_token);
    }
    
    toast({
      title: "Erfolgreich abgemeldet",
      description: "Sie wurden sicher abgemeldet."
    });
  };

  const getClientIP = async (): Promise<string> => {
    try {
      // Multiple fallbacks for robust IP detection
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip'
      ];
      
      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(service, { 
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          
          const data = await response.json();
          const ip = data.ip || data.query || data.origin?.split(' ')[0];
          if (ip && ip !== 'unknown') return ip;
        } catch {
          continue;
        }
      }
      
      return 'unknown';
    } catch (error) {
      // Remove sensitive logging
      return 'unknown';
    }
  };

  return {
    user,
    session,
    sessionValid,
    isLoading,
    handleSecureLogin,
    handleSecureLogout,
    validateCurrentSession,
  };
};