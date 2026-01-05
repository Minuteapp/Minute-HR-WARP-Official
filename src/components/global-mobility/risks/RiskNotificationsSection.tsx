import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react";

export const RiskNotificationsSection = () => {
  const notifications = [
    {
      icon: Bell,
      title: "Push-Benachrichtigungen",
      description: "Bei kritischen Risiken und Fristüberschreitungen",
      enabled: true
    },
    {
      icon: Mail,
      title: "E-Mail-Alerts",
      description: "Tägliche Zusammenfassung offener Risiken",
      enabled: true
    },
    {
      icon: MessageSquare,
      title: "Teams/Slack",
      description: "Echtzeit-Benachrichtigungen an Verantwortliche",
      enabled: false
    },
    {
      icon: AlertTriangle,
      title: "Eskalation",
      description: "Automatische Eskalation bei Nichtbeachtung",
      enabled: true
    }
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Automatische Benachrichtigungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {notifications.map((notif) => (
            <div key={notif.title} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <notif.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.description}</p>
                </div>
              </div>
              <Switch defaultChecked={notif.enabled} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
