import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Clock, AlertCircle, CheckCircle, History } from "lucide-react";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function BookingRulesCorrectionsTab() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Nachbuchungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Nachbuchungen</CardTitle>
          </div>
          <CardDescription>
            Regeln für das nachträgliche Erfassen von Arbeitszeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nachbuchungen erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter können vergangene Zeiten nachträglich erfassen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frist für Nachbuchungen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="7" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Tage</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Nach dieser Frist sind Nachbuchungen nicht mehr möglich
              </p>
            </div>
            <div className="space-y-2">
              <Label>Maximale Rückwirkung</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="30" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Tage</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Absolute Grenze für rückwirkende Buchungen
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Begründungspflicht bei Nachbuchungen</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter müssen Nachbuchungen begründen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nachbuchungen nur mit Genehmigung</Label>
              <p className="text-sm text-muted-foreground">
                Vorgesetzter muss Nachbuchungen freigeben
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Korrekturen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" />
            <CardTitle>Korrekturen bestehender Buchungen</CardTitle>
          </div>
          <CardDescription>
            Regeln für Änderungen an bereits erfassten Zeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Korrekturen erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Bestehende Zeitbuchungen können korrigiert werden
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Korrekturen nur mit Genehmigung</Label>
              <p className="text-sm text-muted-foreground">
                Alle Korrekturen erfordern Vorgesetzten-Freigabe
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Korrektur-Workflow</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Workflow wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Mitarbeiter → Teamleiter</SelectItem>
                <SelectItem value="hr">Mitarbeiter → Teamleiter → HR</SelectItem>
                <SelectItem value="hr-only">Mitarbeiter → HR</SelectItem>
                <SelectItem value="auto">Automatische Genehmigung unter Schwellenwert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Begründungspflicht bei Korrekturen</Label>
              <p className="text-sm text-muted-foreground">
                Jede Korrektur erfordert eine schriftliche Begründung
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale Korrekturen pro Monat</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="10" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Korrekturen</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Korrekturfrist</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="14" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Tage</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stornierungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle>Stornierungen</CardTitle>
          </div>
          <CardDescription>
            Regeln für das Löschen von Zeitbuchungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stornierung durch Mitarbeiter erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter können eigene Buchungen stornieren
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stornierung nur am selben Tag</Label>
              <p className="text-sm text-muted-foreground">
                Buchungen können nur am Tag der Erfassung storniert werden
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stornierungen protokollieren</Label>
              <p className="text-sm text-muted-foreground">
                Alle Stornierungen werden im Audit-Log erfasst
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Rundungsregeln */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Rundungsregeln</CardTitle>
          </div>
          <CardDescription>
            Automatische Rundung von Zeitbuchungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Rundung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Zeiten werden auf definierte Intervalle gerundet
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rundungsintervall Arbeitsbeginn</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute</SelectItem>
                  <SelectItem value="5">5 Minuten</SelectItem>
                  <SelectItem value="10">10 Minuten</SelectItem>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rundungsintervall Arbeitsende</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute</SelectItem>
                  <SelectItem value="5">5 Minuten</SelectItem>
                  <SelectItem value="10">10 Minuten</SelectItem>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rundungsmodus</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Modus wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fair">Kaufmännisch (ab Hälfte aufrunden)</SelectItem>
                <SelectItem value="up">Immer aufrunden</SelectItem>
                <SelectItem value="down">Immer abrunden</SelectItem>
                <SelectItem value="employee-favor">Zugunsten Mitarbeiter</SelectItem>
                <SelectItem value="employer-favor">Zugunsten Arbeitgeber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Minimale Buchungsdauer */}
      <Card>
        <CardHeader>
          <CardTitle>Minimale Buchungsdauer & Lücken</CardTitle>
          <CardDescription>
            Regeln für Kurzzeit-Buchungen und fehlende Buchungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimale Buchungsdauer</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="15" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Kürzere Buchungen werden abgelehnt oder aufgerundet
              </p>
            </div>
            <div className="space-y-2">
              <Label>Lücken-Toleranz</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="5" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lücken unter dieser Dauer werden automatisch geschlossen
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lücken-Erkennung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                System warnt bei vergessenen Buchungen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Erinnerung bei fehlender Buchung</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter werden bei vergessenen Buchungen benachrichtigt
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Abschluss-Sperren */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <CardTitle>Abschlüsse & Sperren</CardTitle>
          </div>
          <CardDescription>
            Regeln für periodische Abschlüsse und Änderungssperren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Abschluss-Modus</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Modus wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein automatischer Abschluss</SelectItem>
                <SelectItem value="weekly">Wöchentlicher Abschluss</SelectItem>
                <SelectItem value="monthly">Monatlicher Abschluss</SelectItem>
                <SelectItem value="payroll">Lohnabrechnungs-Zyklus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sperre nach Abschluss</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="3" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Tage nach Periodenende</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Entsperrung durch</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">Nur HR</SelectItem>
                  <SelectItem value="admin">HR oder Admin</SelectItem>
                  <SelectItem value="manager">Teamleiter oder höher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vier-Augen-Prinzip für Entsperrung</Label>
              <p className="text-sm text-muted-foreground">
                Zwei Berechtigte müssen Entsperrung bestätigen
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Speichern */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Verwerfen</Button>
        <Button disabled={!canManage}>Einstellungen speichern</Button>
      </div>
    </div>
  );
}
