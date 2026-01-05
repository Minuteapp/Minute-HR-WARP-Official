import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function TimeTrackingRoleVisibility() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teamleiter</CardTitle>
          <CardDescription>
            Erweiterte Berechtigungen für Team-Management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamlead-approve">Korrekturen genehmigen</Label>
              <p className="text-sm text-muted-foreground">
                Zeitkorrekturen der Teammitglieder bearbeiten
              </p>
            </div>
            <Switch id="teamlead-approve" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}