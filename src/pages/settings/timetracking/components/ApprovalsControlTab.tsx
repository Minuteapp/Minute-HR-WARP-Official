import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, AlertTriangle, Clock, Shield, ArrowRight } from "lucide-react";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function ApprovalsControlTab() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Genehmigungspflichten */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <CardTitle>Genehmigungspflichten</CardTitle>
          </div>
          <CardDescription>
            Was muss genehmigt werden?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Zeitbuchungen</Badge>
                <span className="text-sm text-muted-foreground">Tägliche Arbeitszeiten</span>
              </div>
              <Switch disabled={!canManage} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Überstunden</Badge>
                <span className="text-sm text-muted-foreground">Über Soll-Arbeitszeit</span>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Korrekturen</Badge>
                <span className="text-sm text-muted-foreground">Änderungen an Buchungen</span>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Nachbuchungen</Badge>
                <span className="text-sm text-muted-foreground">Rückwirkende Erfassung</span>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Monatsabschluss</Badge>
                <span className="text-sm text-muted-foreground">Periodische Freigabe</span>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genehmigungs-Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            <CardTitle>Genehmigungs-Workflow</CardTitle>
          </div>
          <CardDescription>
            Wer genehmigt in welcher Reihenfolge?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standard-Workflow für Zeitbuchungen</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Workflow wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Genehmigung erforderlich</SelectItem>
                <SelectItem value="manager">Nur Teamleiter</SelectItem>
                <SelectItem value="manager-hr">Teamleiter → HR</SelectItem>
                <SelectItem value="hr">Nur HR</SelectItem>
                <SelectItem value="auto-threshold">Automatisch bis Schwellenwert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Workflow für Überstunden</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Workflow wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Nur Teamleiter</SelectItem>
                <SelectItem value="manager-hr">Teamleiter → HR</SelectItem>
                <SelectItem value="manager-finance">Teamleiter → Finanzen</SelectItem>
                <SelectItem value="auto-small">Auto bis 5h/Woche, dann Teamleiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Workflow für Korrekturen</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Workflow wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Nur Teamleiter</SelectItem>
                <SelectItem value="hr">Nur HR</SelectItem>
                <SelectItem value="manager-hr">Teamleiter → HR</SelectItem>
                <SelectItem value="four-eyes">Vier-Augen-Prinzip</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Selbstgenehmigung für Führungskräfte</Label>
              <p className="text-sm text-muted-foreground">
                Führungskräfte können eigene Zeiten selbst genehmigen
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Vertretungsregeln */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Vertretungsregeln</CardTitle>
          </div>
          <CardDescription>
            Wer genehmigt bei Abwesenheit des Vorgesetzten?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Vertretung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Bei Abwesenheit übernimmt die Vertretung
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Vertretungs-Hierarchie</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Modus wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deputy">Definierte Stellvertretung</SelectItem>
                <SelectItem value="escalate">Eskalation an nächsthöhere Ebene</SelectItem>
                <SelectItem value="team">Jeder Teamleiter des Teams</SelectItem>
                <SelectItem value="hr">Automatisch an HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vertretung greift nach</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="2" disabled={!canManage} />
              <span className="text-sm text-muted-foreground">Tagen Abwesenheit</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Benachrichtigung bei Vertretungsübernahme</Label>
              <p className="text-sm text-muted-foreground">
                Original-Genehmiger wird informiert
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Eskalation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Eskalation bei fehlender Freigabe</CardTitle>
          </div>
          <CardDescription>
            Was passiert, wenn nicht rechtzeitig genehmigt wird?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Eskalation aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Eskalation bei überfälligen Genehmigungen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Erste Erinnerung nach</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="2" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Tagen</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Eskalation nach</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="5" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Tagen</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eskalationsziel</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Ziel wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next-level">Nächsthöhere Führungsebene</SelectItem>
                <SelectItem value="hr">HR-Abteilung</SelectItem>
                <SelectItem value="both">Führungsebene + HR</SelectItem>
                <SelectItem value="admin">Systemadministrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Genehmigung bei Nicht-Reaktion</Label>
              <p className="text-sm text-muted-foreground">
                Nach X Tagen wird automatisch genehmigt
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Auto-Genehmigung nach</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="14" disabled={!canManage} />
              <span className="text-sm text-muted-foreground">Tagen</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatische Genehmigung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Automatische Genehmigung</CardTitle>
          </div>
          <CardDescription>
            Schwellenwerte für automatische Freigabe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Genehmigung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Buchungen unter Schwellenwert werden automatisch genehmigt
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Überstunden-Schwellenwert</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="2" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden/Woche</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Korrektur-Schwellenwert</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="30" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nur bei plausiblen Buchungen</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Genehmigung nur wenn System keine Auffälligkeiten erkennt
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Massengenehmigung */}
      <Card>
        <CardHeader>
          <CardTitle>Massengenehmigung</CardTitle>
          <CardDescription>
            Erlauben von Sammelgenehmigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Massengenehmigung erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Mehrere Buchungen können auf einmal genehmigt werden
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Maximale Anzahl pro Massengenehmigung</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="50" disabled={!canManage} />
              <span className="text-sm text-muted-foreground">Buchungen</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bestätigung bei Massengenehmigung</Label>
              <p className="text-sm text-muted-foreground">
                Zusätzliche Bestätigung bei mehr als 10 Buchungen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Vier-Augen-Prinzip */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Vier-Augen-Prinzip</CardTitle>
          </div>
          <CardDescription>
            Doppelte Genehmigung für kritische Aktionen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Korrekturen</Badge>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Stornierungen</Badge>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Entsperrungen</Badge>
              </div>
              <Switch disabled={!canManage} defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Überstunden {">"} 10h/Woche</Badge>
              </div>
              <Switch disabled={!canManage} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zweiter Genehmiger</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR-Mitarbeiter</SelectItem>
                <SelectItem value="manager">Anderer Teamleiter</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="any">Beliebiger Berechtigter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Protokoll */}
      <Card>
        <CardHeader>
          <CardTitle>Audit & Protokollierung</CardTitle>
          <CardDescription>
            Nachvollziehbarkeit aller Genehmigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vollständiges Audit-Log</Label>
              <p className="text-sm text-muted-foreground">
                Alle Genehmigungsaktionen werden protokolliert
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP-Adresse protokollieren</Label>
              <p className="text-sm text-muted-foreground">
                IP des Genehmigenden wird gespeichert
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Geräteinformationen speichern</Label>
              <p className="text-sm text-muted-foreground">
                Browser und Gerät werden protokolliert
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Aufbewahrungsfrist Audit-Logs</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Frist wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Jahr</SelectItem>
                <SelectItem value="2">2 Jahre</SelectItem>
                <SelectItem value="5">5 Jahre</SelectItem>
                <SelectItem value="10">10 Jahre</SelectItem>
                <SelectItem value="unlimited">Unbegrenzt</SelectItem>
              </SelectContent>
            </Select>
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
