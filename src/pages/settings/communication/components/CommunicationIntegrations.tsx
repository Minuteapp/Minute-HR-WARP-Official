import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, Mail, Plug, DollarSign, Globe } from "lucide-react";

export default function CommunicationIntegrations() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kalender-Integrationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Microsoft Outlook</h4>
                  <Badge variant="secondary">Verbunden</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Automatische Termineinträge für Benachrichtigungen</p>
                <div className="flex items-center justify-between">
                  <Switch defaultChecked />
                  <Button variant="outline" size="sm">Konfigurieren</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Google Calendar</h4>
                  <Badge variant="outline">Nicht verbunden</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Synchronisation mit Google Workspace</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">Verbinden</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">iCal / CalDAV</h4>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Standard-Kalender-Protokolle</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">Einrichten</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat & Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Microsoft Teams</h4>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Teams-Kanäle für Benachrichtigungen</p>
                <div className="space-y-2">
                  <Input placeholder="Webhook URL" />
                  <div className="flex items-center justify-between">
                    <Switch defaultChecked />
                    <Button variant="outline" size="sm">Testen</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Slack</h4>
                  <Badge variant="outline">Inaktiv</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Slack-Workspaces verbinden</p>
                <div className="space-y-2">
                  <Input placeholder="Slack Bot Token" />
                  <div className="flex items-center justify-between">
                    <Switch />
                    <Button variant="outline" size="sm">Autorisieren</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">WhatsApp Business</h4>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">WhatsApp Business API</p>
                <div className="space-y-2">
                  <Input placeholder="Business Account ID" />
                  <div className="flex items-center justify-between">
                    <Switch />
                    <Button variant="outline" size="sm">Verifizieren</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Discord</h4>
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Discord-Server Integration</p>
                <div className="space-y-2">
                  <Input placeholder="Discord Webhook" />
                  <div className="flex items-center justify-between">
                    <Switch />
                    <Button variant="outline" size="sm">Hinzufügen</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Lohn & Gehalt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">SevDesk</h4>
                <p className="text-sm text-muted-foreground mb-2">Buchhaltungs-Integration</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">API Key</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">DATEV</h4>
                <p className="text-sm text-muted-foreground mb-2">Steuerberater-Software</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">Verbinden</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">Lexoffice</h4>
                <p className="text-sm text-muted-foreground mb-2">Cloud-Buchhaltung</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">OAuth</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            API & Drittsysteme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>REST API aktivieren</Label>
                <p className="text-sm text-muted-foreground">Externe Systeme können Benachrichtigungen senden</p>
              </div>
              <Switch />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input value="https://api.unternehmen.de/notifications" readOnly />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input value="••••••••••••••••" readOnly />
                  <Button variant="outline" size="sm">Regenerieren</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            EU-Portale & Behörden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">EU-Nachhaltigkeitsportal</h4>
                <p className="text-sm text-muted-foreground mb-2">Automatische Meldungen für CSRD</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">Zertifikat</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">Bundesagentur für Arbeit</h4>
                <p className="text-sm text-muted-foreground mb-2">Meldungen für Arbeitsmarktstatistik</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">ELSTER</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">Berufsgenossenschaft</h4>
                <p className="text-sm text-muted-foreground mb-2">Unfallmeldungen und Prävention</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">UV-Portal</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">GDPR One-Stop-Shop</h4>
                <p className="text-sm text-muted-foreground mb-2">Datenschutzbehörden-Meldungen</p>
                <div className="flex items-center justify-between">
                  <Switch />
                  <Button variant="outline" size="sm">DSA Portal</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Alle Tests ausführen</Button>
        <Button>Integrationen speichern</Button>
      </div>
    </div>
  );
}