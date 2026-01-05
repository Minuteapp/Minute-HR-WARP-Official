import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, Lock, Activity, AlertTriangle, Key, Users, Wifi, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface SecurityAuditLog {
  id: string;
  action: string;
  resource_type: string;
  user_id: string;
  created_at: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
  ip_address?: string;
  details: any;
}

interface UserSession {
  id: string;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  is_active: boolean;
  created_at: string;
}

const SecuritySettings = () => {
  const { settings, loading: settingsLoading, saveSettings } = useEffectiveSettings('security');
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local state for security settings
  const [localSettings, setLocalSettings] = useState({
    session_timeout_minutes: 480,
    max_failed_logins: 5,
    lockout_duration_minutes: 30,
    require_2fa: false,
    mfa_sms_enabled: true,
    mfa_authenticator_enabled: true,
    mfa_email_enabled: true,
    password_min_length: 12,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_number: true,
    password_require_special: true,
    password_expiry_days: 90,
    password_history_count: 5,
    login_alerts: true,
    security_changes_alerts: true,
    suspicious_activity_alerts: true,
    ip_whitelist_enabled: false,
    adaptive_auth_enabled: true,
    detect_new_device: true,
    detect_unusual_location: true,
    audit_logging: true,
    audit_retention_days: 365,
    data_encryption: true,
    encryption_at_rest: true
  });

  // Initialize from DB settings
  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const newSettings = { ...localSettings };
      settings.forEach((setting: any) => {
        const key = setting.key;
        if (key in newSettings) {
          const value = setting.effective_value ?? setting.default_value;
          if (typeof newSettings[key as keyof typeof newSettings] === 'boolean') {
            (newSettings as any)[key] = value === true || value === 'true';
          } else if (typeof newSettings[key as keyof typeof newSettings] === 'number') {
            (newSettings as any)[key] = Number(value) || 0;
          } else {
            (newSettings as any)[key] = String(value).replace(/^"|"$/g, '');
          }
        }
      });
      setLocalSettings(newSettings);
    }
  }, [settings]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const { data: logs } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logs) setAuditLogs(logs);

      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (sessions) setUserSessions(sessions);
    } catch (error) {
      console.error('Fehler beim Laden der Sicherheitsdaten:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(localSettings).map(([key, value]) => ({
        key,
        value
      }));
      await saveSettings(settingsToSave);
      toast.success('Sicherheitseinstellungen gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleInvalidateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          invalidated_at: new Date().toISOString(),
          invalidated_reason: 'Manual invalidation by admin'
        })
        .eq('id', sessionId);

      if (error) {
        toast.error('Fehler beim Invalidieren der Session');
      } else {
        toast.success('Session erfolgreich invalidiert');
        loadSecurityData();
      }
    } catch (error) {
      toast.error('Fehler beim Invalidieren der Session');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'critical': return 'Kritisch';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      default: return 'Niedrig';
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheitsübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Aktive Sessions</p>
                  <p className="text-2xl font-bold">{userSessions.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sicherheitsereignisse (24h)</p>
                  <p className="text-2xl font-bold">
                    {auditLogs.filter(log => 
                      new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sicherheitsstatus</p>
                  <Badge variant="secondary" className="text-green-600">Aktiv</Badge>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="password">Passwort</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sicherheitsrichtlinien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Session-Timeout (Minuten)</Label>
                  <Input
                    type="number"
                    value={localSettings.session_timeout_minutes}
                    onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value) || 480)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max. fehlgeschlagene Anmeldungen</Label>
                  <Input
                    type="number"
                    value={localSettings.max_failed_logins}
                    onChange={(e) => handleChange('max_failed_logins', parseInt(e.target.value) || 5)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sperrzeit nach Fehlversuchen (Minuten)</Label>
                  <Input
                    type="number"
                    value={localSettings.lockout_duration_minutes}
                    onChange={(e) => handleChange('lockout_duration_minutes', parseInt(e.target.value) || 30)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Audit-Aufbewahrung (Tage)</Label>
                  <Input
                    type="number"
                    value={localSettings.audit_retention_days}
                    onChange={(e) => handleChange('audit_retention_days', parseInt(e.target.value) || 365)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Benachrichtigungen</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Anmelde-Benachrichtigungen</Label>
                  <Switch
                    checked={localSettings.login_alerts}
                    onCheckedChange={(v) => handleChange('login_alerts', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Sicherheitsänderungen</Label>
                  <Switch
                    checked={localSettings.security_changes_alerts}
                    onCheckedChange={(v) => handleChange('security_changes_alerts', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Verdächtige Aktivitäten</Label>
                  <Switch
                    checked={localSettings.suspicious_activity_alerts}
                    onCheckedChange={(v) => handleChange('suspicious_activity_alerts', v)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Erweiterte Sicherheit</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Adaptive Authentifizierung</Label>
                    <p className="text-sm text-muted-foreground">Risikobasierte Prüfung</p>
                  </div>
                  <Switch
                    checked={localSettings.adaptive_auth_enabled}
                    onCheckedChange={(v) => handleChange('adaptive_auth_enabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Neue Geräte erkennen</Label>
                  <Switch
                    checked={localSettings.detect_new_device}
                    onCheckedChange={(v) => handleChange('detect_new_device', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Ungewöhnliche Orte erkennen</Label>
                  <Switch
                    checked={localSettings.detect_unusual_location}
                    onCheckedChange={(v) => handleChange('detect_unusual_location', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Datenverschlüsselung</Label>
                  <Switch
                    checked={localSettings.data_encryption}
                    onCheckedChange={(v) => handleChange('data_encryption', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Passwort-Richtlinien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mindestlänge</Label>
                  <Input
                    type="number"
                    value={localSettings.password_min_length}
                    onChange={(e) => handleChange('password_min_length', parseInt(e.target.value) || 12)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passwort-Ablauf (Tage, 0 = nie)</Label>
                  <Input
                    type="number"
                    value={localSettings.password_expiry_days}
                    onChange={(e) => handleChange('password_expiry_days', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passwort-Historie</Label>
                  <Input
                    type="number"
                    value={localSettings.password_history_count}
                    onChange={(e) => handleChange('password_history_count', parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Komplexitätsanforderungen</h4>

                <div className="flex items-center justify-between">
                  <Label>Großbuchstaben erforderlich</Label>
                  <Switch
                    checked={localSettings.password_require_uppercase}
                    onCheckedChange={(v) => handleChange('password_require_uppercase', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Kleinbuchstaben erforderlich</Label>
                  <Switch
                    checked={localSettings.password_require_lowercase}
                    onCheckedChange={(v) => handleChange('password_require_lowercase', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Zahl erforderlich</Label>
                  <Switch
                    checked={localSettings.password_require_number}
                    onCheckedChange={(v) => handleChange('password_require_number', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Sonderzeichen erforderlich</Label>
                  <Switch
                    checked={localSettings.password_require_special}
                    onCheckedChange={(v) => handleChange('password_require_special', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Faktor-Authentifizierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>2FA erforderlich</Label>
                  <p className="text-sm text-muted-foreground">Alle Benutzer müssen 2FA aktivieren</p>
                </div>
                <Switch
                  checked={localSettings.require_2fa}
                  onCheckedChange={(v) => handleChange('require_2fa', v)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Verfügbare MFA-Methoden</h4>

                <div className="flex items-center justify-between">
                  <Label>SMS-basierte 2FA</Label>
                  <Switch
                    checked={localSettings.mfa_sms_enabled}
                    onCheckedChange={(v) => handleChange('mfa_sms_enabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Authenticator-App</Label>
                  <Switch
                    checked={localSettings.mfa_authenticator_enabled}
                    onCheckedChange={(v) => handleChange('mfa_authenticator_enabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>E-Mail-basierte 2FA</Label>
                  <Switch
                    checked={localSettings.mfa_email_enabled}
                    onCheckedChange={(v) => handleChange('mfa_email_enabled', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Sicherheits-Audit-Protokoll
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Lade Audit-Logs...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-muted-foreground">Keine Audit-Logs verfügbar.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getRiskColor(log.risk_level)}>
                          {getRiskText(log.risk_level)}
                        </Badge>
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.resource_type} • {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <Badge variant="secondary" className="text-green-600">Erfolgreich</Badge>
                        ) : (
                          <Badge variant="destructive">Fehlgeschlagen</Badge>
                        )}
                        {log.ip_address && (
                          <Badge variant="outline">{log.ip_address}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Aktive Benutzersessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userSessions.length === 0 ? (
                <p className="text-muted-foreground">Keine aktiven Sessions verfügbar.</p>
              ) : (
                <div className="space-y-2">
                  {userSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Session {session.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          IP: {session.ip_address || 'Unbekannt'} • 
                          Letzte Aktivität: {new Date(session.last_activity).toLocaleString()}
                        </p>
                        {session.user_agent && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                            {session.user_agent}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInvalidateSession(session.id)}
                      >
                        Beenden
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sicherheitseinstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
