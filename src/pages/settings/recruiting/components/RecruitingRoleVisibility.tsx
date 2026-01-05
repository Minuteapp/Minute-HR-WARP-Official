import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function RecruitingRoleVisibility() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('recruiting', 'manage');

  return (
    <div className="space-y-6">
      {/* Rollenübersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Rollen-Matrix</CardTitle>
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
                  <td className="p-2">Interne Stellen anzeigen</td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Bewerbungen einsehen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Team</Badge></td>
                  <td className="text-center p-2"><Badge>Bereich</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Stellen erstellen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Antrag</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Bewerbungen bewerten</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Team</Badge></td>
                  <td className="text-center p-2"><Badge>Bereich</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Budget einsehen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                  <td className="text-center p-2"><Badge variant="secondary">✓</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Systemeinstellungen</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Badge>Teil</Badge></td>
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
            Berechtigungen für normale Angestellte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="employee-internal-jobs">Interne Stellenausschreibungen</Label>
              <p className="text-sm text-muted-foreground">
                Zugriff auf interne Karrieremöglichkeiten
              </p>
            </div>
            <Switch id="employee-internal-jobs" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="employee-apply">Bewerbungen einreichen</Label>
              <p className="text-sm text-muted-foreground">
                Auf interne Stellen bewerben können
              </p>
            </div>
            <Switch id="employee-apply" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="employee-referrals">Mitarbeiterempfehlungen</Label>
              <p className="text-sm text-muted-foreground">
                Externe Kandidaten empfehlen können
              </p>
            </div>
            <Switch id="employee-referrals" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Teamleiter-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Teamleiter</CardTitle>
          <CardDescription>
            Erweiterte Berechtigungen für Führungskräfte
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
                <SelectItem value="own-team">Nur eigenes Team</SelectItem>
                <SelectItem value="department">Gesamte Abteilung</SelectItem>
                <SelectItem value="subordinates">Alle untergeordneten Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamlead-feedback">Bewerberfeedback</Label>
              <p className="text-sm text-muted-foreground">
                Bewertungen und Kommentare zu Kandidaten
              </p>
            </div>
            <Switch id="teamlead-feedback" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamlead-interviews">Interview-Planung</Label>
              <p className="text-sm text-muted-foreground">
                Interviews koordinieren und durchführen
              </p>
            </div>
            <Switch id="teamlead-interviews" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Manager-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Manager</CardTitle>
          <CardDescription>
            Management-Berechtigungen mit Budget-Verantwortung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-budget">Budget-Übersicht</Label>
              <p className="text-sm text-muted-foreground">
                Recruiting-Budgets und Kosten einsehen
              </p>
            </div>
            <Switch id="manager-budget" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-reports">Analytics & Reports</Label>
              <p className="text-sm text-muted-foreground">
                Detaillierte Recruiting-Auswertungen
              </p>
            </div>
            <Switch id="manager-reports" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="manager-approve">Stellen genehmigen</Label>
              <p className="text-sm text-muted-foreground">
                Finale Freigabe für Stellenausschreibungen
              </p>
            </div>
            <Switch id="manager-approve" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* HR Manager-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>HR Manager</CardTitle>
          <CardDescription>
            Vollzugriff auf alle Recruiting-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-full-access">Vollzugriff Kandidaten</Label>
              <p className="text-sm text-muted-foreground">
                Alle Bewerbungen und Kandidatenprofile
              </p>
            </div>
            <Switch id="hr-full-access" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-workflows">Workflow-Verwaltung</Label>
              <p className="text-sm text-muted-foreground">
                Genehmigungsprozesse konfigurieren
              </p>
            </div>
            <Switch id="hr-workflows" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hr-integrations">Basis-Integrationen</Label>
              <p className="text-sm text-muted-foreground">
                Job-Portale und E-Mail-Templates verwalten
              </p>
            </div>
            <Switch id="hr-integrations" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Admin-Rolle */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator</CardTitle>
          <CardDescription>
            Systemweite Kontrolle und Konfiguration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-system">System-Konfiguration</Label>
              <p className="text-sm text-muted-foreground">
                Alle Systemeinstellungen und Integrationen
              </p>
            </div>
            <Switch id="admin-system" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-audit">Audit-Protokolle</Label>
              <p className="text-sm text-muted-foreground">
                Vollständige Aktivitätsprotokolle einsehen
              </p>
            </div>
            <Switch id="admin-audit" defaultChecked disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-privacy">Datenschutz-Verwaltung</Label>
              <p className="text-sm text-muted-foreground">
                DSGVO-Einstellungen und Datenexporte
              </p>
            </div>
            <Switch id="admin-privacy" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}