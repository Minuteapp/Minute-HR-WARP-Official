
import { Settings, Bell, Users, Shield, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

export default function ProjectSettingsPage() {
  return (
    <StandardPageLayout
      title="Projekteinstellungen"
      subtitle="Konfigurieren Sie die Einstellungen für das Projektmanagement"
    >
      <div className="space-y-6">
        {/* Benachrichtigungen */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              Benachrichtigungen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">E-Mail-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie E-Mails bei Projektaktualisierungen
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Fälligkeitserinnerungen</Label>
                <p className="text-sm text-muted-foreground">
                  Automatische Erinnerungen vor Projektdeadlines
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Team-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Benachrichtigungen bei Team-Änderungen
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Team-Einstellungen */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Team-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultRole">Standard-Rolle für neue Mitglieder</Label>
                <Input id="defaultRole" defaultValue="Mitarbeiter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Maximale Teamgröße</Label>
                <Input id="maxTeamSize" type="number" defaultValue="10" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatische Team-Zuweisung</Label>
                <p className="text-sm text-muted-foreground">
                  Neue Projekte automatisch verfügbaren Teams zuweisen
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Sicherheitseinstellungen */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              Sicherheit & Zugriffsrechte
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Projektvisibilität</Label>
                <p className="text-sm text-muted-foreground">
                  Standardmäßig neue Projekte für alle sichtbar machen
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Externe Freigabe erlauben</Label>
                <p className="text-sm text-muted-foreground">
                  Projektlinks für externe Personen freigeben
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Datenaufbewahrung (Tage)</Label>
              <Input id="dataRetention" type="number" defaultValue="365" />
            </div>
          </CardContent>
        </Card>

        {/* Allgemeine Einstellungen */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-5 w-5 text-primary" />
              </div>
              Allgemeine Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Standard-Währung</Label>
              <Input id="defaultCurrency" defaultValue="EUR" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeZone">Zeitzone</Label>
              <Input id="timeZone" defaultValue="Europe/Berlin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectPrefix">Projekt-Präfix</Label>
              <Input id="projectPrefix" placeholder="z.B. PRJ-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customFields">Benutzerdefinierte Felder</Label>
              <Textarea 
                id="customFields" 
                placeholder="Definieren Sie zusätzliche Felder für Projekte..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Aktionen */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Zurücksetzen</Button>
          <Button>Einstellungen speichern</Button>
        </div>
      </div>
    </StandardPageLayout>
  );
}
