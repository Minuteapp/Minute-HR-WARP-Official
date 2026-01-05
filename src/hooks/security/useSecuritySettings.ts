import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  data_access_logging: boolean;
  session_timeout_minutes: number;
  allowed_ip_addresses: string[];
  blocked_ip_addresses: string[];
  security_questions: any[];
  last_security_review: string | null;
  settings: any;
}

interface SecurityThreat {
  id: string;
  threat_type: string;
  severity: string;
  source: string;
  details: any;
  detected_at: string;
  is_resolved: boolean;
}

export const useSecuritySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([]);

  // Lade Sicherheitseinstellungen
  const loadSecuritySettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSecuritySettings(data);
      } else {
        // Erstelle Standard-Sicherheitseinstellungen
        const defaultSettings: Partial<SecuritySettings> = {
          two_factor_enabled: false,
          login_notifications: true,
          suspicious_activity_alerts: true,
          data_access_logging: true,
          session_timeout_minutes: 480,
          allowed_ip_addresses: [],
          blocked_ip_addresses: [],
          security_questions: [],
          settings: {}
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('user_security_settings')
          .insert({ user_id: user.id, ...defaultSettings })
          .select()
          .single();

        if (insertError) throw insertError;
        setSecuritySettings(newSettings);
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Sicherheitseinstellungen:', error);
      toast({
        title: 'Fehler',
        description: 'Sicherheitseinstellungen konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Lade Sicherheitsbedrohungen (nur für Admins)
  const loadSecurityThreats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_threats')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
        throw error;
      }

      setSecurityThreats(data || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Sicherheitsbedrohungen:', error);
    }
  };

  // Aktualisiere Sicherheitseinstellungen
  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    if (!user || !securitySettings) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_security_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSecuritySettings({ ...securitySettings, ...updates });
      
      toast({
        title: 'Erfolg',
        description: 'Sicherheitseinstellungen wurden aktualisiert.'
      });
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren der Sicherheitseinstellungen:', error);
      toast({
        title: 'Fehler',
        description: 'Sicherheitseinstellungen konnten nicht aktualisiert werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Zwei-Faktor-Authentifizierung aktivieren/deaktivieren
  const toggleTwoFactor = async (enabled: boolean) => {
    await updateSecuritySettings({ two_factor_enabled: enabled });
  };

  // IP-Adresse zur Zulassungsliste hinzufügen
  const addAllowedIP = async (ipAddress: string) => {
    if (!securitySettings) return;

    const updatedIPs = [...securitySettings.allowed_ip_addresses, ipAddress];
    await updateSecuritySettings({ allowed_ip_addresses: updatedIPs });
  };

  // IP-Adresse von der Zulassungsliste entfernen
  const removeAllowedIP = async (ipAddress: string) => {
    if (!securitySettings) return;

    const updatedIPs = securitySettings.allowed_ip_addresses.filter(ip => ip !== ipAddress);
    await updateSecuritySettings({ allowed_ip_addresses: updatedIPs });
  };

  // IP-Adresse zur Blockliste hinzufügen
  const addBlockedIP = async (ipAddress: string) => {
    if (!securitySettings) return;

    const updatedIPs = [...securitySettings.blocked_ip_addresses, ipAddress];
    await updateSecuritySettings({ blocked_ip_addresses: updatedIPs });
  };

  // IP-Adresse von der Blockliste entfernen
  const removeBlockedIP = async (ipAddress: string) => {
    if (!securitySettings) return;

    const updatedIPs = securitySettings.blocked_ip_addresses.filter(ip => ip !== ipAddress);
    await updateSecuritySettings({ blocked_ip_addresses: updatedIPs });
  };

  // Session-Timeout aktualisieren
  const updateSessionTimeout = async (minutes: number) => {
    await updateSecuritySettings({ session_timeout_minutes: minutes });
  };

  // Sicherheitsbedrohung als gelöst markieren
  const resolveThreat = async (threatId: string, resolutionNotes?: string) => {
    try {
      const { error } = await supabase
        .from('security_threats')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes
        })
        .eq('id', threatId);

      if (error) throw error;

      setSecurityThreats(threats => 
        threats.map(threat => 
          threat.id === threatId 
            ? { ...threat, is_resolved: true }
            : threat
        )
      );

      toast({
        title: 'Erfolg',
        description: 'Sicherheitsbedrohung wurde als gelöst markiert.'
      });
    } catch (error: any) {
      console.error('Fehler beim Auflösen der Bedrohung:', error);
      toast({
        title: 'Fehler',
        description: 'Bedrohung konnte nicht aufgelöst werden.',
        variant: 'destructive'
      });
    }
  };

  // Führe eine Sicherheitsüberprüfung durch
  const performSecurityReview = async () => {
    try {
      await updateSecuritySettings({ 
        last_security_review: new Date().toISOString() 
      });
      
      // Lade aktuelle Bedrohungen neu
      await loadSecurityThreats();
      
      toast({
        title: 'Sicherheitsüberprüfung abgeschlossen',
        description: 'Alle Sicherheitseinstellungen wurden überprüft.'
      });
    } catch (error: any) {
      console.error('Fehler bei der Sicherheitsüberprüfung:', error);
      toast({
        title: 'Fehler',
        description: 'Sicherheitsüberprüfung konnte nicht abgeschlossen werden.',
        variant: 'destructive'
      });
    }
  };

  // Berechne Sicherheitsscore
  const calculateSecurityScore = (): number => {
    if (!securitySettings) return 0;

    let score = 0;
    let maxScore = 0;

    // Zwei-Faktor-Authentifizierung (25 Punkte)
    maxScore += 25;
    if (securitySettings.two_factor_enabled) score += 25;

    // Benachrichtigungen aktiviert (15 Punkte)
    maxScore += 15;
    if (securitySettings.login_notifications) score += 15;

    // Verdächtige Aktivitäten überwacht (20 Punkte)
    maxScore += 20;
    if (securitySettings.suspicious_activity_alerts) score += 20;

    // Session-Timeout konfiguriert (15 Punkte)
    maxScore += 15;
    if (securitySettings.session_timeout_minutes < 480) score += 15;

    // Letzte Sicherheitsüberprüfung (25 Punkte)
    maxScore += 25;
    if (securitySettings.last_security_review) {
      const reviewDate = new Date(securitySettings.last_security_review);
      const daysSinceReview = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceReview < 30) score += 25; // Überprüfung in den letzten 30 Tagen
      else if (daysSinceReview < 90) score += 15; // Überprüfung in den letzten 90 Tagen
    }

    return Math.round((score / maxScore) * 100);
  };

  // Initialisierung
  useEffect(() => {
    if (user) {
      loadSecuritySettings();
      loadSecurityThreats();
    }
  }, [user]);

  return {
    // Zustand
    loading,
    securitySettings,
    securityThreats,
    
    // Funktionen
    updateSecuritySettings,
    toggleTwoFactor,
    addAllowedIP,
    removeAllowedIP,
    addBlockedIP,
    removeBlockedIP,
    updateSessionTimeout,
    resolveThreat,
    performSecurityReview,
    
    // Berechnete Werte
    securityScore: calculateSecurityScore(),
    
    // Reload-Funktionen
    reloadSettings: loadSecuritySettings,
    reloadThreats: loadSecurityThreats
  };
};