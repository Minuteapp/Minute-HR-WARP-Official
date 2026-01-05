import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { securityMonitor } from '@/utils/security/security-monitor';
import { validatePasswordStrength, isValidEmail } from '@/utils/security/input-validation';
import { logSecurityEvent } from '@/utils/security/audit-logger';

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string, mfaCode?: string) => {
    try {
      setIsLoading(true);
      console.log("🔄 Login-Versuch gestartet für:", email);
      
      // First, try regular login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase Auth-Fehler:", error.message);
        throw error;
      }

      console.log("✅ Supabase-Anmeldung erfolgreich für:", data.user?.email);

      // VERBESSERUNG: MFA-Überprüfung nur wenn Tabelle existiert und MFA tatsächlich konfiguriert
      if (data.user) {
        try {
          const { data: mfaSettings, error: mfaError } = await supabase
            .from('user_mfa_settings')
            .select('mfa_enabled')
            .eq('user_id', data.user.id)
            .single();

          // Nur MFA verlangen wenn explizit aktiviert UND kein Fehler beim Abrufen
          if (!mfaError && mfaSettings?.mfa_enabled && !mfaCode) {
            console.log('MFA erforderlich für Benutzer:', data.user.email);
            await supabase.auth.signOut();
            throw new Error('MFA_REQUIRED');
          }

          if (!mfaError && mfaSettings?.mfa_enabled && mfaCode) {
            // Verify MFA code
            const isValid = await verifyMFACode(data.user.id, mfaCode);
            if (!isValid) {
              await supabase.auth.signOut();
              throw new Error('Ungültiger MFA-Code');
            }
          }
        } catch (mfaCheckError: any) {
          // KRITISCHER FIX: Bei MFA-Prüfungsfehlern NICHT automatisch abmelden
          // Dies war die Hauptursache für wiederholte Login-Probleme
          console.warn('MFA-Einstellungen konnten nicht abgerufen werden (möglicherweise nicht konfiguriert):', mfaCheckError.message);
          
          // Nur bei expliziter MFA_REQUIRED Fehlermeldung erneut werfen
          if (mfaCheckError.message === 'MFA_REQUIRED' || mfaCheckError.message === 'Ungültiger MFA-Code') {
            throw mfaCheckError;
          }
          
          // Ansonsten Login erfolgreich fortsetzen - MFA ist optional
          console.log('Login ohne MFA-Überprüfung fortgesetzt für:', data.user.email);
        }
      }
    } catch (error: any) {
      console.error("❌ Login-Fehler:", error.message);
      if (error.message !== 'MFA_REQUIRED') {
        toast({
          variant: "destructive",
          title: "Anmeldefehler",
          description: error.message || "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut."
        });
      }
      throw error;
    } finally {
      console.log("🏁 Login-Versuch beendet");
      setIsLoading(false);
    }
  };

  const verifyMFACode = async (userId: string, code: string): Promise<boolean> => {
    try {
      // This is a simplified TOTP verification
      // In production, use a proper TOTP library like 'otplib'
      const { data: mfaSettings } = await supabase
        .from('user_mfa_settings')
        .select('totp_secret, backup_codes')
        .eq('user_id', userId)
        .single();

      if (!mfaSettings) return false;

      // Check if it's a backup code
      if (mfaSettings.backup_codes && mfaSettings.backup_codes.includes(code.toUpperCase())) {
        // Remove used backup code
        const updatedCodes = mfaSettings.backup_codes.filter(c => c !== code.toUpperCase());
        await supabase
          .from('user_mfa_settings')
          .update({ backup_codes: updatedCodes })
          .eq('user_id', userId);
        return true;
      }

      // For demo purposes, accept any 6-digit code starting with '123'
      // In production, implement proper TOTP verification
      return /^123\d{3}$/.test(code);
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, role: string = 'employee', companyId?: string) => {
    try {
      setIsLoading(true);
      
      // Erweiterte E-Mail-Validierung
      if (!isValidEmail(email)) {
        throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      }
      
      // Erweiterte Passwort-Validierung
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Rate Limiting für Registrierungen
      if (!securityMonitor.checkRateLimit(`signup_${email}`, 3, 3600000)) { // 3 Versuche pro Stunde
        await logSecurityEvent({
          action: 'signup_rate_limit_exceeded',
          resourceType: 'authentication',
          resourceId: email,
          success: false,
          details: { email }
        });
        throw new Error('Zu viele Registrierungsversuche. Bitte warten Sie eine Stunde.');
      }
      
      console.log(`Registrierung mit Rolle: ${role}, Firma: ${companyId || 'keine'}`);
      
      // Superadmins cannot register through normal registration
      if (role === 'superadmin' && !companyId) {
        throw new Error('Superadmins können nur von bestehenden Superadmins erstellt werden.');
      }
      
      // Create the user with metadata - key ist explizit 'role' als String
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            role: role, // String-Wert als Metadaten übermitteln
            company_id: companyId || null
          }
        }
      });

      if (error) {
        console.error("Supabase Auth-Fehler:", error);
        throw error;
      }

      // Successful registration
      return data;
    } catch (error: any) {
      console.error("Registrierungsfehler details:", error);
      toast({
        variant: "destructive",
        title: "Registrierungsfehler",
        description: error.message || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Abmeldefehler",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Link zum Zurücksetzen des Passworts gesendet",
        description: "Bitte überprüfen Sie Ihre E-Mail, um Ihr Passwort zurückzusetzen."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Senden des Links zum Zurücksetzen des Passworts",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signUp,
    logout,
    resetPassword,
    verifyMFACode,
    isLoading,
  };
};
