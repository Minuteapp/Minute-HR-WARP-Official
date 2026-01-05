import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function TimeTrackingRoleVisibility() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Rollen-Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Rollen-Matrix Zeiterfassung</CardTitle>
          <CardDescription>
            Übersicht der Berechtigungen für alle Benutzerrollen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Berechtigung</th>
                  <th className="text-center p-2">Mitarbeiter</th>
                  <th className="text-center p-2">Teamleiter</th>
                  <th className="text-center p-2">Manager</th>
                  <th className="text-center p-2">HR Manager</th>
                  <th className="text-center p-2">Admin</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="p-2">Eigene Zeiten einsehen</td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Fremde Zeiten einsehen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Team</Badge></td>
                  <td className="text-center p-2"><Badge>Abteilung</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Korrekturen beantragen</td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Korrekturen genehmigen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Team</Badge></td>
                  <td className="text-center p-2"><Badge>Abteilung</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Reports erstellen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Basic</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Geräte verwalten</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Basis</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Systemeinstellungen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mitarbeiter-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter</CardTitle>
          <CardDescription>
            Grundlegende Zeiterfassungsberechtigungen für Angestellte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="employee-view-own">Eigene Zeiten einsehen</Label>
              <p className="text-sm text-muted-foreground">
                Zugriff auf die eigenen Zeiterfassungsdaten
              </p>
            </div>
            <Switch id="employee-view-own" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="employee-corrections">Korrekturen beantragen</Label>
              <p className="text-sm text-muted-foreground">
                Vergessenes Ein-/Ausstempeln korrigieren lassen
              </p>
            </div>
            <Switch id="employee-corrections" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="employee-mobile">Mobile Zeiterfassung</Label>
              <p className="text-sm text-muted-foreground">
                Smartphone-App für Zeiterfassung nutzen
              </p>
            </div>
            <Switch id="employee-mobile" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-export">Eigene Daten exportieren</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Export-Berechtigung..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Export</SelectItem>
                <SelectItem value="pdf-only">Nur PDF</SelectItem>
                <SelectItem value="all">PDF + Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teamleiter-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Teamleiter</CardTitle>
          <CardDescription>
            Erweiterte Berechtigungen für Team-Management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamlead-scope">Sichtbarkeitsbereich</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Bereich wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct-reports">Nur direkte Mitarbeiter</SelectItem>
                <SelectItem value="team">Gesamtes Team</SelectItem>
                <SelectItem value="sub-teams">Team + Unterteams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamlead-approve">Korrekturen genehmigen</Label>
              <p className="text-sm text-muted-foreground">
                Zeitkorrekturen der Teammitglieder bearbeiten
              </p>
            </div>
            <Switch id="teamlead-approve" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamlead-reports">Team-Reports</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeit-Auswertungen für das Team erstellen
              </p>
            </div>
            <Switch id="teamlead-reports" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamlead-overtime">Überstunden genehmigen</Label>
              <p className="text-sm text-muted-foreground">
                Überstunden für Teammitglieder freigeben
              </p>
            </div>
            <Switch id="teamlead-overtime" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamlead-max-correction">Max. Korrekturzeit (Tage)</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Zeitraum wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Tag</SelectItem>
                <SelectItem value="7">7 Tage</SelectItem>
                <SelectItem value="30">30 Tage</SelectItem>
                <SelectItem value="unlimited">Unbegrenzt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Manager-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Manager</CardTitle>
          <CardDescription>
            Abteilungsweite Kontrolle und Auswertungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-department">Abteilungsweite Sicht</Label>
              <p className="text-sm text-muted-foreground">
                Alle Mitarbeiter der Abteilung einsehen
              </p>
            </div>
            <Switch id="manager-department" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-analytics">Erweiterte Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Detaillierte Auswertungen und Trends
              </p>
            </div>
            <Switch id="manager-analytics" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-cost-analysis">Kostenanalyse</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeit-Kosten und Budget-Übersichten
              </p>
            </div>
            <Switch id="manager-cost-analysis" disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-compliance">Compliance-Überwachung</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Warnungen bei Gesetzesverstößen
              </p>
            </div>
            <Switch id="manager-compliance" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager-export-level">Export-Berechtigung</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Export-Level wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Nur Zusammenfassungen</SelectItem>
                <SelectItem value="detailed">Detaillierte Daten</SelectItem>
                <SelectItem value="anonymized">Anonymisierte Daten</SelectItem>
                <SelectItem value="full">Vollzugriff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* HR Manager-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>HR Manager</CardTitle>
          <CardDescription>
            Vollzugriff auf Arbeitszeitdaten und Genehmigungsworkflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-full-access">Vollzugriff Zeitdaten</Label>
              <p className="text-sm text-muted-foreground">
                Alle Mitarbeiter und alle Zeiträume einsehen
              </p>
            </div>
            <Switch id="hr-full-access" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-workflows">Genehmigungsworkflows</Label>
              <p className="text-sm text-muted-foreground">
                Workflows für Korrekturen und Überstunden konfigurieren
              </p>
            </div>
            <Switch id="hr-workflows" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-legal-settings">Gesetzliche Parameter</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeitgesetze und Pausenregeln anpassen
              </p>
            </div>
            <Switch id="hr-legal-settings" disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-payroll-integration">Lohnabrechnung-Integration</Label>
              <p className="text-sm text-muted-foreground">
                Daten an Payroll-Systeme weiterleiten
              </p>
            </div>
            <Switch id="hr-payroll-integration" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-audit-logs">Audit-Protokolle</Label>
              <p className="text-sm text-muted-foreground">
                Vollständige Aktivitätsprotokolle einsehen
              </p>
            </div>
            <Switch id="hr-audit-logs" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Admin-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator</CardTitle>
          <CardDescription>
            Systemweite Kontrolle und Geräteverwaltung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-device-management">Geräteverwaltung</Label>
              <p className="text-sm text-muted-foreground">
                Alle Terminals und Hardware konfigurieren
              </p>
            </div>
            <Switch id="admin-device-management" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-global-rules">Globale Regeln</Label>
              <p className="text-sm text-muted-foreground">
                Systemweite Arbeitszeitregeln definieren
              </p>
            </div>
            <Switch id="admin-global-rules" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-integrations">System-Integrationen</Label>
              <p className="text-sm text-muted-foreground">
                APIs und externe Systeme konfigurieren
              </p>
            </div>
            <Switch id="admin-integrations" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-data-management">Datenmanagement</Label>
              <p className="text-sm text-muted-foreground">
                Backup, Archivierung und Datenbereinigung
              </p>
            </div>
            <Switch id="admin-data-management" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-security">Sicherheitseinstellungen</Label>
              <p className="text-sm text-muted-foreground">
                Verschlüsselung, Authentifizierung, Logs
              </p>
            </div>
            <Switch id="admin-security" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-maintenance">Wartungsmodus</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Wartungsoptionen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Wartungsmodus</SelectItem>
                <SelectItem value="scheduled">Geplante Wartung</SelectItem>
                <SelectItem value="emergency">Notfall-Wartung</SelectItem>
                <SelectItem value="readonly">Nur-Lesen-Modus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}