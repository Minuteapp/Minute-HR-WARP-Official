import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Shield, User, Crown } from "lucide-react";

export default function CommunicationRoleVisibility() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Mitarbeiter
            <Badge variant="secondary">Basis-Rolle</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Nur eigene Benachrichtigungen sehen</Label>
                <p className="text-sm text-muted-foreground">Persönliche Nachrichten und Updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Gehaltsbenachrichtigungen erhalten</Label>
                <p className="text-sm text-muted-foreground">Lohnabrechnungen und Gehaltsupdates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Schichtplan-Updates erhalten</Label>
                <p className="text-sm text-muted-foreground">Änderungen im persönlichen Schichtplan</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokument-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">Neue Dokumente im persönlichen Bereich</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Teamleiter
            <Badge variant="outline">Team-Verantwortung</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Team-Benachrichtigungen erhalten</Label>
                <p className="text-sm text-muted-foreground">Abwesenheiten und Anfragen des Teams</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Genehmigungsanfragen</Label>
                <p className="text-sm text-muted-foreground">Urlaub, Krankheit und Spesen zur Freigabe</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Performance-Reminder</Label>
                <p className="text-sm text-muted-foreground">Erinnerungen an Mitarbeitergespräche</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Team-Zertifikate überwachen</Label>
                <p className="text-sm text-muted-foreground">Ablaufende Qualifikationen im Team</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manager
            <Badge variant="outline">Abteilungs-Leitung</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Abteilungsweite Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">Alle Ereignisse in der Abteilung</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Budget & Finanz-Updates</Label>
                <p className="text-sm text-muted-foreground">Kostenstellenberichte und Budgetalarme</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Performance-Reports</Label>
                <p className="text-sm text-muted-foreground">Abteilungsleistung und KPI-Updates</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Warnungen</Label>
                <p className="text-sm text-muted-foreground">Regelkonformität in der Abteilung</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            HR Manager
            <Badge variant="destructive">HR-Vollzugriff</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>HR-übergreifende Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">Alle Personalangelegenheiten</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Recruiting-Updates</Label>
                <p className="text-sm text-muted-foreground">Neue Bewerbungen und Kandidaten</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Krankmeldungen überwachen</Label>
                <p className="text-sm text-muted-foreground">Alle krankheitsbedingten Abwesenheiten</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Gehalts- und Benefit-Updates</Label>
                <p className="text-sm text-muted-foreground">Lohnabrechnungen und Zusatzleistungen</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Admin
            <Badge variant="destructive">System-Administrator</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>System-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">Alle System- und Konfigurationsmeldungen</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sicherheitsalarme</Label>
                <p className="text-sm text-muted-foreground">Unbefugte Zugriffe und Sicherheitswarnungen</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup & Wartung</Label>
                <p className="text-sm text-muted-foreground">Automatische System-Maintenance-Reports</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Integration-Fehler</Label>
                <p className="text-sm text-muted-foreground">API-Fehler und Verbindungsprobleme</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modulspezifische Sichtbarkeit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gehaltsmodul</Label>
              <p className="text-sm text-muted-foreground">Nur eigene Daten für Mitarbeiter, Vollzugriff für HR</p>
            </div>
            <div className="space-y-2">
              <Label>Krankmeldungen</Label>
              <p className="text-sm text-muted-foreground">Team-Sichtbarkeit für Teamleiter, HR-Vollzugriff</p>
            </div>
            <div className="space-y-2">
              <Label>Bewerbungen</Label>
              <p className="text-sm text-muted-foreground">Nur HR und berechtigte Manager</p>
            </div>
            <div className="space-y-2">
              <Label>Performance-Daten</Label>
              <p className="text-sm text-muted-foreground">Hierarchiebasierte Sichtbarkeit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}