import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Key, Shield, Smartphone, QrCode, Fingerprint, Timer } from "lucide-react";

export default function AuthenticationLogin() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSO-Verbindungen</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Aktive Anbieter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA-Nutzer</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Mit 2FA aktiviert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session-Dauer</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8h</div>
            <p className="text-xs text-muted-foreground">Durchschnittlich</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Single Sign-On (SSO)</CardTitle>
            <CardDescription>
              Konfiguration der SSO-Anbieter und Authentifizierungsmethoden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">MS</span>
                  </div>
                  <div>
                    <div className="font-medium">Microsoft 365</div>
                    <div className="text-sm text-muted-foreground">SAML 2.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">Aktiv</Badge>
                  <Switch checked />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">G</span>
                  </div>
                  <div>
                    <div className="font-medium">Google Workspace</div>
                    <div className="text-sm text-muted-foreground">OAuth 2.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">Aktiv</Badge>
                  <Switch checked />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">O</span>
                  </div>
                  <div>
                    <div className="font-medium">Okta</div>
                    <div className="text-sm text-muted-foreground">SAML 2.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Inaktiv</Badge>
                  <Switch />
                </div>
              </div>
            </div>

            <Button className="w-full">
              Neuen SSO-Anbieter hinzufügen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mehrfaktor-Authentifizierung (MFA)</CardTitle>
            <CardDescription>
              Konfiguration der zusätzlichen Sicherheitsebenen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">SMS-Verifizierung</div>
                    <div className="text-sm text-muted-foreground">Via Mobilnummer</div>
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Authenticator App</div>
                    <div className="text-sm text-muted-foreground">TOTP (Google Auth, Authy)</div>
                  </div>
                </div>
                <Switch checked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Hardware-Token</div>
                    <div className="text-sm text-muted-foreground">YubiKey, FIDO2</div>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Biometrische Authentifizierung</div>
                    <div className="text-sm text-muted-foreground">Fingerprint, FaceID</div>
                  </div>
                </div>
                <Switch checked />
              </div>
            </div>

            <div className="space-y-2">
              <Label>MFA-Richtlinie</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Richtlinie wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional für alle</SelectItem>
                  <SelectItem value="required-admin">Pflicht für Admins</SelectItem>
                  <SelectItem value="required-all">Pflicht für alle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR-Code & Mobile Login</CardTitle>
            <CardDescription>
              Smart Detection und mobile Authentifizierungsoptionen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">QR-Code Login aktivieren</div>
                  <div className="text-sm text-muted-foreground">Schneller Login via QR-Scan</div>
                </div>
              </div>
              <Switch checked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-expiry">QR-Code Gültigkeitsdauer (Minuten)</Label>
              <div className="space-y-2">
                <Slider
                  id="qr-expiry"
                  min={1}
                  max={30}
                  step={1}
                  defaultValue={[5]}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 Min</span>
                  <span>5 Min (aktuell)</span>
                  <span>30 Min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Smart Detection Features</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-employee-id">Mitarbeiter-ID automatisch erkennen</Label>
                  <Switch id="auto-employee-id" checked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-verify">Standort-Verifizierung</Label>
                  <Switch id="location-verify" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session-Management</CardTitle>
            <CardDescription>
              Konfiguration von Sessions und Passwort-Richtlinien
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Automatisches Ausloggen nach Inaktivität (Minuten)</Label>
              <div className="space-y-2">
                <Slider
                  id="session-timeout"
                  min={15}
                  max={480}
                  step={15}
                  defaultValue={[60]}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>15 Min</span>
                  <span>60 Min (aktuell)</span>
                  <span>8 Std</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Passwort-Richtlinien</Label>
              
              <div className="space-y-2">
                <Label htmlFor="min-length">Mindestlänge</Label>
                <Input id="min-length" type="number" defaultValue="8" min="6" max="32" />
              </div>

              <div className="space-y-2">
                <Label>Erforderliche Zeichen</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-uppercase">Großbuchstaben</Label>
                    <Switch id="require-uppercase" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-lowercase">Kleinbuchstaben</Label>
                    <Switch id="require-lowercase" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-numbers">Zahlen</Label>
                    <Switch id="require-numbers" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-special">Sonderzeichen</Label>
                    <Switch id="require-special" checked />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-expiry">Passwort-Gültigkeit (Tage)</Label>
                <Input id="password-expiry" type="number" defaultValue="90" min="30" max="365" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}