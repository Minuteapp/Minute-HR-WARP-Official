import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Shield, AlertTriangle } from "lucide-react";

export default function EventBasedNotifications() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mitarbeiter-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Neue Gehaltsabrechnung verfügbar</Label>
                <p className="text-sm text-muted-foreground">Automatische Benachrichtigung bei neuer Lohnabrechnung</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Urlaubsantrag genehmigt/abgelehnt</Label>
                <p className="text-sm text-muted-foreground">Status-Updates für Abwesenheitsanträge</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Krankmeldung bestätigt</Label>
                <p className="text-sm text-muted-foreground">Bestätigung über eingegangene Krankmeldung</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Neues Dokument hochgeladen</Label>
                <p className="text-sm text-muted-foreground">Information über neue Dokumente im persönlichen Bereich</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Schichtänderung / Schichttausch</Label>
                <p className="text-sm text-muted-foreground">Updates bei Änderungen im Schichtplan</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Manager/Teamleiter-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Neue Abwesenheitsanträge im Team</Label>
                <p className="text-sm text-muted-foreground">Genehmigungsanfragen für Urlaub/Krankheit</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auslaufende Zertifikate im Team</Label>
                <p className="text-sm text-muted-foreground">Warnung vor ablaufenden Qualifikationen</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Spesenabrechnungen zur Freigabe</Label>
                <p className="text-sm text-muted-foreground">Neue Ausgaben zur Genehmigung</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Ziel-Fortschritte / Performance-Reminder</Label>
                <p className="text-sm text-muted-foreground">Erinnerungen an Mitarbeitergespräche und Ziele</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            HR/Admin-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Neue Bewerbungen im Recruiting-Modul</Label>
                <p className="text-sm text-muted-foreground">Eingehende Bewerbungen und Kandidaten</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Berichtspflichten (EU-Nachhaltigkeitsbericht)</Label>
                <p className="text-sm text-muted-foreground">Erinnerungen an gesetzliche Meldepflichten</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Verstöße / Audit-Warnungen</Label>
                <p className="text-sm text-muted-foreground">Automatische Compliance-Überwachung</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Sicherheitsalarme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Standort-basierte Sicherheitsalarme</Label>
                <p className="text-sm text-muted-foreground">Automatische Warnungen für kritische Einsätze (Polizei, Feuerwehr)</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notfallbenachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">Sofortige Alarmierung bei Notfällen</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Systemausfall-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">Automatische IT-Störungsmeldungen</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungshäufigkeit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-green-600">Sofort</h4>
                <p className="text-sm text-muted-foreground">Kritische Ereignisse</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-yellow-600">Täglich</h4>
                <p className="text-sm text-muted-foreground">Normale Benachrichtigungen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-600">Wöchentlich</h4>
                <p className="text-sm text-muted-foreground">Zusammenfassungen</p>
              </CardContent>
            </Card>
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