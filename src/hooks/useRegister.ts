
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { validateEmail } from '@/utils/auth/email-validator';
import { isValidUUID } from '@/utils/auth/role-validator';

export interface RegisterParams {
  email: string;
  password: string;
  confirmPassword: string;
  isInvitation: boolean;
  companyId: string | null;
  roleParam: string | null;
}

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (params: RegisterParams) => {
    const { email, password, confirmPassword, isInvitation, companyId, roleParam } = params;
    
    setRegistrationError(null);
    
    // Passwörter validieren
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwörter stimmen nicht überein",
        description: "Bitte überprüfen Sie Ihre Eingaben."
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Passwort zu kurz",
        description: "Passwort muss mindestens 6 Zeichen lang sein."
      });
      return;
    }
    
    // E-Mail validieren
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Ungültige E-Mail-Adresse",
        description: emailValidation.message
      });
      return;
    }
    
    // Firmen-ID validieren
    if (companyId && !isValidUUID(companyId)) {
      toast({
        variant: "destructive",
        title: "Ungültige Firmen-ID",
        description: "Die angegebene Firmen-ID ist ungültig."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Server-seitige Validierung der Registrierungsdaten
      let role = roleParam || 'employee';
      
      // Sicherheitsvalidierung: Admin-Rolle nur mit Einladung
      if (role === 'admin' && (!isInvitation || !companyId)) {
        throw new Error('Admin-Registrierung erfordert eine gültige Einladung');
      }
      
      // Normale Benutzer bekommen immer employee-Rolle
      if (!isInvitation) {
        role = 'employee';
      }
      
      console.log(`Registriere Benutzer mit Rolle: ${role}, Einladung: ${isInvitation}, Firma: ${companyId}`);
      
      await signUp(email.trim(), password, role, companyId || undefined);
      
      // Nach erfolgreicher Registrierung zur Login-Seite weiterleiten
      navigate('/auth/login');
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte melden Sie sich jetzt mit Ihren Zugangsdaten an."
      });
    } catch (error: any) {
      console.error('Registrierungsfehler:', error);
      
      // Ausführlichere Fehlermeldungen
      let errorMessage = error.message || "Ein unbekannter Fehler ist aufgetreten.";
      
      // Fehlermeldung verbessern, wenn es ein Datenbankfehler ist
      if (errorMessage.includes("Database error") || errorMessage.includes("SQL error")) {
        errorMessage = "Fehler bei der Speicherung des Benutzerkontos. Bitte überprüfen Sie, ob die E-Mail-Adresse bereits verwendet wird oder kontaktieren Sie den Support.";
      }
      
      // Debug-Informationen zur Fehlermeldung in der Entwicklung hinzufügen
      if (process.env.NODE_ENV === 'development') {
        console.log('Ursprünglicher Fehler:', error);
        errorMessage += ` (Debug: ${JSON.stringify(error)})`;
      }
      
      setRegistrationError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Registrierungsfehler",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    registrationError,
    handleSubmit
  };
};
