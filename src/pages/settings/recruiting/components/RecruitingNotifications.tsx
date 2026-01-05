import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function RecruitingNotifications() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('recruiting', 'manage');

  return (
    <div className="space-y-6">
      {/* Bewerbungsbenachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle>Bewerbungsbenachrichtigungen</CardTitle>
          <CardDescription>
            Benachrichtigungen bei neuen Bewerbungen und Status-Änderungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-application-email">E-Mail bei neuen Bewerbungen</Label>
                <p className="text-sm text-muted-foreground">
                  HR und Teamleiter informieren
                </p>
              </div>
              <Switch id="new-application-email" disabled={!canManage} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-application-push">Push-Benachrichtigung</Label>
                <p className="text-sm text-muted-foreground">
                  Sofortige Benachrichtigung in der App
                </p>
              </div>
              <Switch id="new-application-push" disabled={!canManage} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification-delay">Verzögerung (Minuten)</Label>
                <Input
                  id="notification-delay"
                  type="number"
                  placeholder="0"
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-notifications">Sammelbenachrichtigungen</Label>
                <Select disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Intervall wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Sofort</SelectItem>
                    <SelectItem value="15min">Alle 15 Min</SelectItem>
                    <SelectItem value="1hour">Stündlich</SelectItem>
                    <SelectItem value="daily">Täglich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status-Updates für Kandidaten */}
      <Card>
        <CardHeader>
          <CardTitle>Kandidaten-Updates</CardTitle>
          <CardDescription>
            Automatische Benachrichtigungen an Bewerber über Status-Änderungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-candidate-updates">Automatische Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Kandidaten bei Status-Änderungen informieren
                </p>
              </div>
              <Switch id="auto-candidate-updates" disabled={!canManage} />
            </div>

            <div className="space-y-2">
              <Label>Status-Updates aktivieren für:</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch id="status-received" disabled={!canManage} />
                  <Label htmlFor="status-received" className="text-sm">Bewerbung erhalten</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status-review" disabled={!canManage} />
                  <Label htmlFor="status-review" className="text-sm">In Bearbeitung</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status-interview" disabled={!canManage} />
                  <Label htmlFor="status-interview" className="text-sm">Interview eingeladen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status-rejected" disabled={!canManage} />
                  <Label htmlFor="status-rejected" className="text-sm">Abgelehnt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status-offer" disabled={!canManage} />
                  <Label htmlFor="status-offer" className="text-sm">Angebot erstellt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status-hired" disabled={!canManage} />
                  <Label htmlFor="status-hired" className="text-sm">Eingestellt</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* E-Mail-Templates */}
      <Card>
        <CardHeader>
          <CardTitle>E-Mail-Vorlagen</CardTitle>
          <CardDescription>
            Anpassung der automatischen E-Mail-Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-type">Vorlage auswählen</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="E-Mail-Vorlage wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application-received">Bewerbung erhalten</SelectItem>
                <SelectItem value="interview-invitation">Interview-Einladung</SelectItem>
                <SelectItem value="rejection">Absage</SelectItem>
                <SelectItem value="offer">Stellenangebot</SelectItem>
                <SelectItem value="welcome">Willkommens-E-Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Betreff</Label>
            <Input
              id="email-subject"
              placeholder="Ihre Bewerbung bei [Firmenname]"
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-content">E-Mail-Inhalt</Label>
            <Textarea
              id="email-content"
              placeholder="Hallo [Name], vielen Dank für Ihre Bewerbung..."
              className="min-h-32"
              disabled={!canManage}
            />
            <p className="text-sm text-muted-foreground">
              Verfügbare Variablen: [Name], [Position], [Firmenname], [Datum]
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={!canManage}>Vorschau</Button>
            <Button disabled={!canManage}>Speichern</Button>
          </div>
        </CardContent>
      </Card>

      {/* Erinnerungen & Fristen */}
      <Card>
        <CardHeader>
          <CardTitle>Erinnerungen & Fristen</CardTitle>
          <CardDescription>
            Automatische Erinnerungen bei offenen Bewerbungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-reminders">Erinnerungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Erinnerungen bei offenen Bewerbungen
              </p>
            </div>
            <Switch id="enable-reminders" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-reminder">Erste Erinnerung (Tage)</Label>
              <Input
                id="first-reminder"
                type="number"
                placeholder="3"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-reminder">Folge-Erinnerung (Tage)</Label>
              <Input
                id="follow-reminder"
                type="number"
                placeholder="7"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation-after">Eskalation nach (Tagen)</Label>
            <Input
              id="escalation-after"
              type="number"
              placeholder="14"
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
          <CardDescription>
            Benachrichtigungen über Recruiting-Reports und Kennzahlen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-reports">Wöchentliche Reports</Label>
              <p className="text-sm text-muted-foreground">
                Übersicht über Bewerbungen und KPIs
              </p>
            </div>
            <Switch id="weekly-reports" disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="monthly-analytics">Monatliche Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Detaillierte Auswertung der Recruiting-Performance
              </p>
            </div>
            <Switch id="monthly-analytics" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-recipients">Report-Empfänger</Label>
            <Input
              id="report-recipients"
              placeholder="hr@firma.de, manager@firma.de"
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}