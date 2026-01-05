import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Brain, AlertTriangle } from "lucide-react";

export default function AISmartDetectionSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anomalie-Erkennung
          </CardTitle>
          <CardDescription>
            Automatische Erkennung ungewöhnlicher Zeiterfassungsmuster
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anomaly-detection">Anomalie-Erkennung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                KI-basierte Erkennung ungewöhnlicher Muster
              </p>
            </div>
            <Switch id="anomaly-detection" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Automatische Berechnungen
          </CardTitle>
          <CardDescription>
            KI-gestützte Berechnung von Zuschlägen und Sonderzeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-calculations">Automatische Berechnungen</Label>
              <p className="text-sm text-muted-foreground">
                Überstunden, Zuschläge automatisch berechnen
              </p>
            </div>
            <Switch id="auto-calculations" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}