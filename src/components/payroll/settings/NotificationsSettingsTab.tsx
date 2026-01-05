import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare } from "lucide-react";

export const NotificationsSettingsTab = () => {
  const [notifications, setNotifications] = useState({
    emailPayrollReady: true,
    emailPayrollErrors: true,
    pushApprovalNeeded: true,
    pushDeadlineReminder: true,
    slackIntegration: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Benachrichtigungen</h2>
        <p className="text-sm text-muted-foreground">Konfigurieren Sie E-Mail und Push-Benachrichtigungen</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">E-Mail Benachrichtigungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="emailPayrollReady" className="cursor-pointer">
                Abrechnung fertig
              </Label>
              <Switch 
                id="emailPayrollReady"
                checked={notifications.emailPayrollReady}
                onCheckedChange={() => toggleNotification("emailPayrollReady")}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="emailPayrollErrors" className="cursor-pointer">
                Fehler bei Abrechnung
              </Label>
              <Switch 
                id="emailPayrollErrors"
                checked={notifications.emailPayrollErrors}
                onCheckedChange={() => toggleNotification("emailPayrollErrors")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Push-Benachrichtigungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="pushApprovalNeeded" className="cursor-pointer">
                Genehmigung erforderlich
              </Label>
              <Switch 
                id="pushApprovalNeeded"
                checked={notifications.pushApprovalNeeded}
                onCheckedChange={() => toggleNotification("pushApprovalNeeded")}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="pushDeadlineReminder" className="cursor-pointer">
                Fristenerinnerung
              </Label>
              <Switch 
                id="pushDeadlineReminder"
                checked={notifications.pushDeadlineReminder}
                onCheckedChange={() => toggleNotification("pushDeadlineReminder")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
