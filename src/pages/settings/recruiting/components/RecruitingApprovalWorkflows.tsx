import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function RecruitingApprovalWorkflows() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('recruiting', 'manage');

  return (
    <div className="space-y-6">
      {/* Workflow-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>Freigabe-Workflows</CardTitle>
          <CardDescription>
            Definition der Genehmigungsschritte für neue Stellenausschreibungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-type">Standard-Workflow</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Workflow-Typ wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-step">1-stufig (Teamleiter {'->'} HR)</SelectItem>
                <SelectItem value="2-step">2-stufig (Teamleiter {'->'} HR {'->'} Manager)</SelectItem>
                <SelectItem value="3-step">3-stufig (Teamleiter {'->'} HR {'->'} Manager {'->'} Admin)</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-approval">Automatische Freigabe</Label>
              <p className="text-sm text-muted-foreground">
                Bestimmte Stellen automatisch ohne Genehmigung freigeben
              </p>
            </div>
            <Switch id="auto-approval" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auto-criteria">Kriterien für Auto-Freigabe</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Kriterium wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget {'<'} 50.000€</SelectItem>
                  <SelectItem value="level">Junior-Positionen</SelectItem>
                  <SelectItem value="department">Bestimmte Abteilungen</SelectItem>
                  <SelectItem value="urgent">Dringende Stellen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalation-time">Eskalationszeit (Stunden)</Label>
              <Input
                id="escalation-time"
                type="number"
                placeholder="48"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow-Stufen */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow-Stufen</CardTitle>
          <CardDescription>
            Detaillierte Konfiguration der einzelnen Genehmigungsschritte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Stufe 1 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Stufe 1: Teamleiter</h4>
                <Badge>Pflicht</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="step1-timeout">Timeout (Stunden)</Label>
                  <Input
                    id="step1-timeout"
                    type="number"
                    placeholder="24"
                    disabled={!canManage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step1-reminder">Erinnerung nach (Stunden)</Label>
                  <Input
                    id="step1-reminder"
                    type="number"
                    placeholder="12"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>

            {/* Stufe 2 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Stufe 2: HR Manager</h4>
                <Badge variant="secondary">Optional</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="step2-timeout">Timeout (Stunden)</Label>
                  <Input
                    id="step2-timeout"
                    type="number"
                    placeholder="48"
                    disabled={!canManage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step2-parallel">Parallele Genehmigung</Label>
                  <Switch id="step2-parallel" disabled={!canManage} />
                </div>
              </div>
            </div>

            {/* Stufe 3 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Stufe 3: Manager/Admin</h4>
                <Badge variant="secondary">Optional</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="step3-condition">Bedingung</Label>
                  <Select disabled={!canManage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wann erforderlich..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget-high">Budget {'>'} 80.000€</SelectItem>
                      <SelectItem value="senior-role">Senior-Positionen</SelectItem>
                      <SelectItem value="management">Management-Rollen</SelectItem>
                      <SelectItem value="always">Immer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step3-timeout">Timeout (Stunden)</Label>
                  <Input
                    id="step3-timeout"
                    type="number"
                    placeholder="72"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" disabled={!canManage}>
            Neuen Workflow hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Eskalationsregeln */}
      <Card>
        <CardHeader>
          <CardTitle>Eskalationsregeln</CardTitle>
          <CardDescription>
            Automatische Eskalation bei Fristüberschreitungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-escalation">Eskalation aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Weiterleitung bei Zeitüberschreitung
              </p>
            </div>
            <Switch id="enable-escalation" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="escalation-target">Eskalationsziel</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="An wen eskalieren..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next-level">Nächste Stufe</SelectItem>
                  <SelectItem value="admin">Direkt an Admin</SelectItem>
                  <SelectItem value="hr-manager">HR Manager</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-escalations">Max. Eskalationen</Label>
              <Input
                id="max-escalations"
                type="number"
                placeholder="3"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}