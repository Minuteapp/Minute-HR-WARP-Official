import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, Shield, Key, Lock, Smartphone, Clock, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { RolePermissionViewDialog } from '@/components/settings/users/RolePermissionViewDialog';

// System-Rollen mit DB-kompatiblen IDs
const SYSTEM_ROLES = [
  { id: 'employee', name: 'Mitarbeiter', description: 'Standard-Mitarbeiter mit Basiszugriff', canDelete: false },
  { id: 'manager', name: 'Manager/Teamleiter', description: 'Führt ein Team, kann genehmigen', canDelete: false },
  { id: 'hr_manager', name: 'HR-Manager', description: 'Voller HR-Zugriff, Personalverwaltung', canDelete: false },
  { id: 'admin', name: 'Administrator', description: 'Systemadministrator mit erweiterten Rechten', canDelete: false },
  { id: 'superadmin', name: 'Superadmin', description: 'Vollzugriff auf alle Module und Funktionen', canDelete: false },
];

export const RolesSecurityTab = () => {
  const [settings, setSettings] = useState({
    customRolesEnabled: true,
    roleInheritance: true,
    temporaryRolesEnabled: true,
    temporaryRoleMaxDays: 90,
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    passwordExpiry: 90,
    passwordHistory: 5,
    passwordMaxAttempts: 5,
    passwordLockoutDuration: 30,
    twoFactorEnabled: true,
    twoFactorMethod: 'app',
    twoFactorEnforced: false,
    twoFactorForAdmins: true,
    twoFactorRememberDevice: true,
    twoFactorRememberDays: 30,
    ipRestrictionEnabled: false,
    ipWhitelist: '',
    ipBlacklistEnabled: false,
    deviceBindingEnabled: false,
    deviceMaxDevices: 3,
    deviceTrustRequired: false,
    sessionTimeout: 480,
    sessionIdleTimeout: 30,
    sessionConcurrent: true,
    sessionMaxConcurrent: 3,
    sessionForceLogout: false,
    ssoEnabled: false,
    ssoProvider: 'none',
    ssoEnforced: false,
  });

  const [selectedRole, setSelectedRole] = useState<{ id: string; name: string } | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleViewPermissions = (roleId: string, roleName: string) => {
    setSelectedRole({ id: roleId, name: roleName });
    setPermissionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Systemrollen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Systemrollen
          </CardTitle>
          <CardDescription>Vordefinierte Rollen im System - Klicken Sie auf "Rechte anzeigen" um die Berechtigungen zu sehen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {SYSTEM_ROLES.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant={role.id === 'superadmin' ? 'destructive' : role.id === 'admin' ? 'default' : 'secondary'}>
                    {role.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{role.description}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewPermissions(role.id, role.name)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Rechte anzeigen
                  </Button>
                  {role.canDelete && (
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Permission View Dialog */}
          <RolePermissionViewDialog
            open={permissionDialogOpen}
            onOpenChange={setPermissionDialogOpen}
            roleId={selectedRole?.id || ''}
            roleName={selectedRole?.name || ''}
          />

          <div className="flex items-center justify-between">
            <div>
              <Label>Eigene Rollen definierbar</Label>
              <p className="text-sm text-muted-foreground">Benutzerdefinierte Rollen erstellen</p>
            </div>
            <Switch 
              checked={settings.customRolesEnabled}
              onCheckedChange={(checked) => updateSetting('customRolesEnabled', checked)}
            />
          </div>

          {settings.customRolesEnabled && (
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Neue Rolle erstellen
            </Button>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Rollenvererbung</Label>
              <p className="text-sm text-muted-foreground">Höhere Rollen erben Rechte niedrigerer</p>
            </div>
            <Switch 
              checked={settings.roleInheritance}
              onCheckedChange={(checked) => updateSetting('roleInheritance', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Zeitlich begrenzte Rollen</Label>
              <p className="text-sm text-muted-foreground">Rollen mit Ablaufdatum vergeben</p>
            </div>
            <Switch 
              checked={settings.temporaryRolesEnabled}
              onCheckedChange={(checked) => updateSetting('temporaryRolesEnabled', checked)}
            />
          </div>

          {settings.temporaryRolesEnabled && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Maximale Dauer (Tage)</Label>
              <Input 
                type="number"
                value={settings.temporaryRoleMaxDays}
                onChange={(e) => updateSetting('temporaryRoleMaxDays', parseInt(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passwortrichtlinien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Passwortrichtlinien
          </CardTitle>
          <CardDescription>Anforderungen an sichere Passwörter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mindestlänge</Label>
              <Input 
                type="number"
                min={8}
                max={32}
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Passwort-Ablauf (Tage, 0 = nie)</Label>
              <Input 
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Großbuchstaben erforderlich</Label>
              <Switch 
                checked={settings.passwordRequireUppercase}
                onCheckedChange={(checked) => updateSetting('passwordRequireUppercase', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Kleinbuchstaben erforderlich</Label>
              <Switch 
                checked={settings.passwordRequireLowercase}
                onCheckedChange={(checked) => updateSetting('passwordRequireLowercase', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Zahlen erforderlich</Label>
              <Switch 
                checked={settings.passwordRequireNumbers}
                onCheckedChange={(checked) => updateSetting('passwordRequireNumbers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Sonderzeichen erforderlich</Label>
              <Switch 
                checked={settings.passwordRequireSpecial}
                onCheckedChange={(checked) => updateSetting('passwordRequireSpecial', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Passwort-Historie (letzte X nicht wiederverwenden)</Label>
              <Input 
                type="number"
                value={settings.passwordHistory}
                onChange={(e) => updateSetting('passwordHistory', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max. Fehlversuche</Label>
              <Input 
                type="number"
                value={settings.passwordMaxAttempts}
                onChange={(e) => updateSetting('passwordMaxAttempts', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sperrzeit nach Fehlversuchen (Minuten)</Label>
            <Input 
              type="number"
              value={settings.passwordLockoutDuration}
              onChange={(e) => updateSetting('passwordLockoutDuration', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Zwei-Faktor-Authentifizierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Zwei-Faktor-Authentifizierung (2FA/MFA)
          </CardTitle>
          <CardDescription>Zusätzliche Sicherheitsebene</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>2FA aktivieren</Label>
              <p className="text-sm text-muted-foreground">Zwei-Faktor-Authentifizierung ermöglichen</p>
            </div>
            <Switch 
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
            />
          </div>

          {settings.twoFactorEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>2FA-Methode</Label>
                <Select value={settings.twoFactorMethod} onValueChange={(v) => updateSetting('twoFactorMethod', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">Authenticator App (TOTP)</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="hardware">Hardware-Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>2FA für alle erzwingen</Label>
                  <p className="text-sm text-muted-foreground">Pflicht für alle Benutzer</p>
                </div>
                <Switch 
                  checked={settings.twoFactorEnforced}
                  onCheckedChange={(checked) => updateSetting('twoFactorEnforced', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>2FA für Admins erzwingen</Label>
                  <p className="text-sm text-muted-foreground">Pflicht für Admin-Rollen</p>
                </div>
                <Switch 
                  checked={settings.twoFactorForAdmins}
                  onCheckedChange={(checked) => updateSetting('twoFactorForAdmins', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Gerät merken</Label>
                  <p className="text-sm text-muted-foreground">Vertrauenswürdige Geräte speichern</p>
                </div>
                <Switch 
                  checked={settings.twoFactorRememberDevice}
                  onCheckedChange={(checked) => updateSetting('twoFactorRememberDevice', checked)}
                />
              </div>

              {settings.twoFactorRememberDevice && (
                <div className="space-y-2">
                  <Label>Gerät merken für (Tage)</Label>
                  <Input 
                    type="number"
                    value={settings.twoFactorRememberDays}
                    onChange={(e) => updateSetting('twoFactorRememberDays', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* IP-Restriktionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            IP-Restriktionen
          </CardTitle>
          <CardDescription>Zugriff nach IP-Adresse einschränken</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>IP-Whitelist aktivieren</Label>
              <p className="text-sm text-muted-foreground">Nur bestimmte IPs erlauben</p>
            </div>
            <Switch 
              checked={settings.ipRestrictionEnabled}
              onCheckedChange={(checked) => updateSetting('ipRestrictionEnabled', checked)}
            />
          </div>

          {settings.ipRestrictionEnabled && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Erlaubte IP-Adressen/Ranges</Label>
              <Input 
                value={settings.ipWhitelist}
                onChange={(e) => updateSetting('ipWhitelist', e.target.value)}
                placeholder="192.168.1.0/24, 10.0.0.1"
              />
              <p className="text-xs text-muted-foreground">Kommagetrennte Liste von IPs oder CIDR-Ranges</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>IP-Blacklist aktivieren</Label>
              <p className="text-sm text-muted-foreground">Bestimmte IPs blockieren</p>
            </div>
            <Switch 
              checked={settings.ipBlacklistEnabled}
              onCheckedChange={(checked) => updateSetting('ipBlacklistEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gerätebindung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Gerätebindung
          </CardTitle>
          <CardDescription>Zugriff auf bestimmte Geräte beschränken</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Gerätebindung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Benutzer an Geräte binden</p>
            </div>
            <Switch 
              checked={settings.deviceBindingEnabled}
              onCheckedChange={(checked) => updateSetting('deviceBindingEnabled', checked)}
            />
          </div>

          {settings.deviceBindingEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Max. Geräte pro Benutzer</Label>
                <Input 
                  type="number"
                  value={settings.deviceMaxDevices}
                  onChange={(e) => updateSetting('deviceMaxDevices', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Geräte-Verifizierung erforderlich</Label>
                  <p className="text-sm text-muted-foreground">Neue Geräte müssen bestätigt werden</p>
                </div>
                <Switch 
                  checked={settings.deviceTrustRequired}
                  onCheckedChange={(checked) => updateSetting('deviceTrustRequired', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session-Einstellungen
          </CardTitle>
          <CardDescription>Zeitlimits und gleichzeitige Sitzungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session-Timeout (Minuten)</Label>
              <Input 
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Idle-Timeout (Minuten)</Label>
              <Input 
                type="number"
                value={settings.sessionIdleTimeout}
                onChange={(e) => updateSetting('sessionIdleTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Gleichzeitige Sessions erlauben</Label>
              <p className="text-sm text-muted-foreground">Mehrere Logins gleichzeitig</p>
            </div>
            <Switch 
              checked={settings.sessionConcurrent}
              onCheckedChange={(checked) => updateSetting('sessionConcurrent', checked)}
            />
          </div>

          {settings.sessionConcurrent && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Max. gleichzeitige Sessions</Label>
              <Input 
                type="number"
                value={settings.sessionMaxConcurrent}
                onChange={(e) => updateSetting('sessionMaxConcurrent', parseInt(e.target.value))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Ältere Sessions beenden</Label>
              <p className="text-sm text-muted-foreground">Bei neuem Login alte Session beenden</p>
            </div>
            <Switch 
              checked={settings.sessionForceLogout}
              onCheckedChange={(checked) => updateSetting('sessionForceLogout', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SSO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Single Sign-On (SSO)
          </CardTitle>
          <CardDescription>Enterprise-Authentifizierung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>SSO aktivieren</Label>
              <p className="text-sm text-muted-foreground">Single Sign-On ermöglichen</p>
            </div>
            <Switch 
              checked={settings.ssoEnabled}
              onCheckedChange={(checked) => updateSetting('ssoEnabled', checked)}
            />
          </div>

          {settings.ssoEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>SSO-Provider</Label>
                <Select value={settings.ssoProvider} onValueChange={(v) => updateSetting('ssoProvider', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keiner</SelectItem>
                    <SelectItem value="azure">Microsoft Azure AD</SelectItem>
                    <SelectItem value="okta">Okta</SelectItem>
                    <SelectItem value="google">Google Workspace</SelectItem>
                    <SelectItem value="saml">SAML 2.0 (Generisch)</SelectItem>
                    <SelectItem value="oidc">OpenID Connect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SSO erzwingen</Label>
                  <p className="text-sm text-muted-foreground">Nur SSO-Login erlauben</p>
                </div>
                <Switch 
                  checked={settings.ssoEnforced}
                  onCheckedChange={(checked) => updateSetting('ssoEnforced', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesSecurityTab;
