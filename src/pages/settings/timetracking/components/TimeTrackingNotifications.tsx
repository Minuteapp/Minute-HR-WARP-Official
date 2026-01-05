import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Bell, Clock, AlertTriangle, Mail, Smartphone } from "lucide-react";

export default function TimeTrackingNotifications() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Check-in/out Erinnerungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Check-in/out Erinnerungen
          </CardTitle>
          <CardDescription>
            Automatische Erinnerungen an das Ein- und Ausstempeln
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="checkin-reminders">Check-in Erinnerungen</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter an das Einstempeln erinnern
              </p>
            </div>
            <Switch id="checkin-reminders" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin-time">Standard Check-in Zeit</Label>
              <Input
                id="checkin-time"
                type="time"
                placeholder="08:00"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkin-delay">Erinnerung nach (Min.)</Label>
              <Input
                id="checkin-delay"
                type="number"
                placeholder="15"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="checkout-reminders">Check-out Erinnerungen</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter an das Ausstempeln erinnern
              </p>
            </div>
            <Switch id="checkout-reminders" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkout-time">Standard Check-out Zeit</Label>
              <Input
                id="checkout-time"
                type="time"
                placeholder="17:00"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-delay">Erinnerung nach (Min.)</Label>
              <Input
                id="checkout-delay"
                type="number"
                placeholder="30"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-method">Erinnerungsmethode</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Methode wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push">Push-Benachrichtigung</SelectItem>
                <SelectItem value="email">E-Mail</SelectItem>
                <SelectItem value="both">Push + E-Mail</SelectItem>
                <SelectItem value="sms">SMS (Premium)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gesetzesverstöße */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Warnungen bei Gesetzesverstößen
          </CardTitle>
          <CardDescription>
            Automatische Benachrichtigungen bei Verletzung von Arbeitszeitgesetzen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="law-violations">Gesetzesverstöße überwachen</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Warnung bei Verstößen gegen Arbeitszeitgesetze
              </p>
            </div>
            <Switch id="law-violations" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Überwachte Verstöße</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="overtime-violation" defaultChecked disabled={!canManage} />
                <Label htmlFor="overtime-violation" className="text-sm">Überschreitung max. Arbeitszeit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="rest-violation" defaultChecked disabled={!canManage} />
                <Label htmlFor="rest-violation" className="text-sm">Unterschreitung Ruhezeit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="break-violation" defaultChecked disabled={!canManage} />
                <Label htmlFor="break-violation" className="text-sm">Fehlende Pausen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="sunday-violation" disabled={!canManage} />
                <Label htmlFor="sunday-violation" className="text-sm">Unbefugte Sonntagsarbeit</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="violation-recipients">Benachrichtigungs-Empfänger</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="notify-employee" disabled={!canManage} />
                <Label htmlFor="notify-employee" className="text-sm">Mitarbeiter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notify-teamlead" defaultChecked disabled={!canManage} />
                <Label htmlFor="notify-teamlead" className="text-sm">Teamleiter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notify-hr" defaultChecked disabled={!canManage} />
                <Label htmlFor="notify-hr" className="text-sm">HR Manager</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notify-admin" disabled={!canManage} />
                <Label htmlFor="notify-admin" className="text-sm">Admin</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="violation-severity">Schweregrad-Kategorien</Label>
            <div className="space-y-2">
              <div className="border rounded-lg p-3 border-yellow-200 bg-yellow-50">
                <h4 className="font-medium text-yellow-800">Warnung</h4>
                <p className="text-sm text-yellow-700">Geringfügige Überschreitungen (bis 15 Min.)</p>
              </div>
              <div className="border rounded-lg p-3 border-orange-200 bg-orange-50">
                <h4 className="font-medium text-orange-800">Kritisch</h4>
                <p className="text-sm text-orange-700">Deutliche Verstöße (15-60 Min.)</p>
              </div>
              <div className="border rounded-lg p-3 border-red-200 bg-red-50">
                <h4 className="font-medium text-red-800">Schwerwiegend</h4>
                <p className="text-sm text-red-700">Gravierende Verstöße (über 60 Min.)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Korrekturanträge */}
      <Card>
        <CardHeader>
          <CardTitle>Korrekturanträge</CardTitle>
          <CardDescription>
            Benachrichtigungen bei offenen Korrekturanträgen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="correction-notifications">Korrektur-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Erinnerung bei offenen Korrekturen
              </p>
            </div>
            <Switch id="correction-notifications" defaultChecked disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-reminder">Erste Erinnerung (Stunden)</Label>
              <Input
                id="first-reminder"
                type="number"
                placeholder="24"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-reminder">Folge-Erinnerung (Stunden)</Label>
              <Input
                id="follow-reminder"
                type="number"
                placeholder="48"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation-time">Eskalation nach (Tagen)</Label>
            <Input
              id="escalation-time"
              type="number"
              placeholder="7"
              disabled={!canManage}
            />
            <p className="text-sm text-muted-foreground">
              Automatische Weiterleitung an HR Manager
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-approval">Automatische Genehmigung</Label>
              <p className="text-sm text-muted-foreground">
                Geringfügige Korrekturen automatisch genehmigen
              </p>
            </div>
            <Switch id="auto-approval" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-threshold">Auto-Genehmigung Schwellenwert (Min.)</Label>
            <Input
              id="auto-threshold"
              type="number"
              placeholder="5"
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-Mail-Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Templates
          </CardTitle>
          <CardDescription>
            Anpassung der automatischen E-Mail-Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-type">Template auswählen</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="E-Mail-Template wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkin-reminder">Check-in Erinnerung</SelectItem>
                <SelectItem value="checkout-reminder">Check-out Erinnerung</SelectItem>
                <SelectItem value="overtime-warning">Überstunden-Warnung</SelectItem>
                <SelectItem value="law-violation">Gesetzesverstoß</SelectItem>
                <SelectItem value="correction-request">Korrekturantrag</SelectItem>
                <SelectItem value="weekly-summary">Wöchentliche Zusammenfassung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Betreff</Label>
            <Input
              id="email-subject"
              placeholder="Erinnerung: Zeiterfassung [Datum]"
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-content">E-Mail-Inhalt</Label>
            <Textarea
              id="email-content"
              placeholder="Hallo [Name], bitte denken Sie daran, Ihre Arbeitszeit zu erfassen..."
              className="min-h-32"
              disabled={!canManage}
            />
            <p className="text-sm text-muted-foreground">
              Verfügbare Variablen: [Name], [Datum], [Zeit], [Standort], [Abteilung]
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={!canManage}>Vorschau</Button>
            <Button disabled={!canManage}>Speichern</Button>
            <Button variant="outline" disabled={!canManage}>Test-E-Mail senden</Button>
          </div>
        </CardContent>
      </Card>

      {/* Push-Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Mobile Benachrichtigungen für die Zeiterfassungs-App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Push-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Mobile Benachrichtigungen an Mitarbeiter-Apps senden
              </p>
            </div>
            <Switch id="push-enabled" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Benachrichtigungstypen</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="push-reminders" disabled={!canManage} />
                <Label htmlFor="push-reminders" className="text-sm">Erinnerungen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="push-warnings" disabled={!canManage} />
                <Label htmlFor="push-warnings" className="text-sm">Warnungen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="push-approvals" disabled={!canManage} />
                <Label htmlFor="push-approvals" className="text-sm">Genehmigungen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="push-updates" disabled={!canManage} />
                <Label htmlFor="push-updates" className="text-sm">System-Updates</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-hours-start">Ruhezeit von</Label>
              <Input
                id="quiet-hours-start"
                type="time"
                placeholder="22:00"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-hours-end">Ruhezeit bis</Label>
              <Input
                id="quiet-hours-end"
                type="time"
                placeholder="06:00"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekend-notifications">Wochenend-Benachrichtigungen</Label>
              <p className="text-sm text-muted-foreground">
                Push-Nachrichten auch am Wochenende senden
              </p>
            </div>
            <Switch id="weekend-notifications" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Manager-Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Automatische Manager-Reports</CardTitle>
          <CardDescription>
            Regelmäßige Berichte für Führungskräfte über auffällige Muster
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-reports">Manager-Reports aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Berichte über Zeiterfassungsanomalien
              </p>
            </div>
            <Switch id="manager-reports" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-frequency">Berichtshäufigkeit</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Häufigkeit wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="on-demand">Bei Auffälligkeiten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Report-Inhalte</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="report-overtime" defaultChecked disabled={!canManage} />
                <Label htmlFor="report-overtime" className="text-sm">Überstunden-Übersicht</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="report-violations" defaultChecked disabled={!canManage} />
                <Label htmlFor="report-violations" className="text-sm">Gesetzesverstöße</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="report-corrections" defaultChecked disabled={!canManage} />
                <Label htmlFor="report-corrections" className="text-sm">Offene Korrekturen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="report-trends" disabled={!canManage} />
                <Label htmlFor="report-trends" className="text-sm">Trends & Analysen</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-recipients">Report-Empfänger</Label>
            <Input
              id="report-recipients"
              placeholder="manager@firma.de, hr@firma.de"
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-day">Versandtag (für wöchentliche Reports)</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Wochentag wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Montag</SelectItem>
                <SelectItem value="tuesday">Dienstag</SelectItem>
                <SelectItem value="wednesday">Mittwoch</SelectItem>
                <SelectItem value="thursday">Donnerstag</SelectItem>
                <SelectItem value="friday">Freitag</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}