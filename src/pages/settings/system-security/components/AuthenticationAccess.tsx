import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Smartphone, 
  Fingerprint, 
  QrCode, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  Globe
} from "lucide-react";

export default function AuthenticationAccess() {
  const authMethods = [
    { 
      id: "mfa", 
      name: "Multi-Faktor-Authentifizierung", 
      description: "SMS, E-Mail, Authenticator App, Hardware-Token",
      icon: Shield,
      enabled: true,
      usage: "8,245 Nutzer"
    },
    { 
      id: "qr-login", 
      name: "QR-Code Login", 
      description: "Für Terminals und App mit Mitarbeiter-ID",
      icon: QrCode,
      enabled: true,
      usage: "7,892 Nutzer"
    },
    { 
      id: "biometric", 
      name: "Biometrische Authentifizierung", 
      description: "Fingerprint, FaceID für Mobile-App",
      icon: Fingerprint,
      enabled: true,
      usage: "4,321 Nutzer"
    },
    { 
      id: "adaptive", 
      name: "Adaptive Authentifizierung", 
      description: "Risiko-basierte zusätzliche Sicherheitsstufen",
      icon: AlertTriangle,
      enabled: true,
      usage: "Alle Nutzer"
    },
    { 
      id: "sso", 
      name: "Single Sign-On (SSO)", 
      description: "Azure AD, Google Workspace, Okta",
      icon: Key,
      enabled: false,
      usage: "Nicht konfiguriert"
    }
  ];

  const authStats = {
    totalLogins: 45678,
    successfulToday: 8234,
    mfaEnabled: 92,
    riskyAttempts: 23,
    blockedAttempts: 7
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins heute</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authStats.totalLogins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Erfolgreiche Anmeldungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA-Abdeckung</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authStats.mfaEnabled}%</div>
            <p className="text-xs text-muted-foreground">Nutzer mit MFA aktiviert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolgreiche Logins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authStats.successfulToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Heute erfolgreich</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risiko-Versuche</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authStats.riskyAttempts}</div>
            <p className="text-xs text-muted-foreground">Verdächtige Aktivitäten</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockiert</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authStats.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Automatisch verhindert</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentifizierungsmethoden</CardTitle>
            <CardDescription>
              Konfiguration und Verwaltung aller Authentifizierungsverfahren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                      <div className="text-xs text-blue-600 mt-1">{method.usage}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={method.enabled ? "outline" : "secondary"}>
                      {method.enabled ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Switch checked={method.enabled} />
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MFA-Konfiguration</CardTitle>
            <CardDescription>
              Einstellungen für Multi-Faktor-Authentifizierung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">MFA-Methoden</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS-Verifizierung</div>
                    <div className="text-sm text-muted-foreground">Einmalcode per SMS</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">E-Mail-Verifizierung</div>
                    <div className="text-sm text-muted-foreground">Einmalcode per E-Mail</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Authenticator App</div>
                    <div className="text-sm text-muted-foreground">Google/Microsoft Authenticator</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Hardware-Token</div>
                    <div className="text-sm text-muted-foreground">YubiKey, FIDO2</div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfa-grace-period">MFA-Schonfrist (Stunden)</Label>
                <Input id="mfa-grace-period" type="number" defaultValue="8" min="0" max="48" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-codes">Backup-Codes</Label>
                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Backup-Codes</SelectItem>
                    <SelectItem value="10">10 Backup-Codes</SelectItem>
                    <SelectItem value="15">15 Backup-Codes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adaptive Authentifizierung</CardTitle>
            <CardDescription>
              Risiko-basierte Sicherheitsmaßnahmen und intelligente Erkennung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Risiko-Faktoren</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Neues Gerät</div>
                    <div className="text-sm text-muted-foreground">Login von unbekanntem Gerät</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Ungewöhnlicher Standort</div>
                    <div className="text-sm text-muted-foreground">Login aus neuem Land/Stadt</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Ungewöhnliche Zeit</div>
                    <div className="text-sm text-muted-foreground">Login außerhalb Arbeitszeiten</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">VPN-Erkennung</div>
                    <div className="text-sm text-muted-foreground">Login über VPN-Verbindung</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-threshold">Risiko-Schwellenwert</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig (60%)</SelectItem>
                    <SelectItem value="medium">Mittel (80%)</SelectItem>
                    <SelectItem value="high">Hoch (95%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SSO-Integration</CardTitle>
            <CardDescription>
              Single Sign-On Konfiguration mit externen Anbietern
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Verfügbare SSO-Anbieter</h4>
              
              <div className="space-y-3">
                {[
                  { name: "Microsoft Azure AD", status: "Konfiguriert", users: 4567 },
                  { name: "Google Workspace", status: "Nicht konfiguriert", users: 0 },
                  { name: "Okta", status: "Nicht konfiguriert", users: 0 },
                  { name: "SAML 2.0", status: "Nicht konfiguriert", users: 0 }
                ].map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.users > 0 ? `${provider.users} aktive Nutzer` : provider.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={provider.users > 0 ? "outline" : "secondary"}>
                        {provider.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {provider.users > 0 ? "Konfigurieren" : "Einrichten"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>SSO-Vorteile:</strong> Einmalige Anmeldung, zentrale Benutzerverwaltung, 
                  reduzierte Passwort-Komplexität und erhöhte Sicherheit durch professionelle 
                  Identitätsanbieter.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Authentifizierungs-Events</CardTitle>
          <CardDescription>
            Echtzeitübersicht der Authentifizierungsereignisse und Sicherheitswarnungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Erfolgreiche Logins</span>
                </div>
                <div className="text-2xl font-bold text-green-600">8,234</div>
                <p className="text-xs text-green-600">Heute</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">MFA-Herausforderungen</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">127</div>
                <p className="text-xs text-yellow-600">Zusätzliche Verifikation</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Blockierte Versuche</span>
                </div>
                <div className="text-2xl font-bold text-red-600">7</div>
                <p className="text-xs text-red-600">Automatisch verhindert</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-800">
                <strong>Sicherheitsstatus:</strong> Alle Authentifizierungssysteme sind aktiv und funktionieren 
                ordnungsgemäß. Die adaptive Authentifizierung überwacht kontinuierlich Risikofaktoren und 
                schützt vor unautorisierten Zugriffsversuchen.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}