import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Bell, Clock } from "lucide-react";

export default function TimeTrackingNotifications() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
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
        </CardContent>
      </Card>
    </div>
  );
}