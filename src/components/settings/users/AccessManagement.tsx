
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Key, AlertTriangle, Clock } from "lucide-react";

const AccessManagement = () => {
  const accessLogs = [
    { user: "Max Mustermann", action: "Login", time: "10:30", status: "Erfolgreich" },
    { user: "Anna Schmidt", action: "Passwort geändert", time: "09:15", status: "Erfolgreich" },
    { user: "John Doe", action: "Login fehlgeschlagen", time: "08:45", status: "Fehlgeschlagen" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Passwort-Richtlinien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Mindestlänge</span>
                <Badge>8 Zeichen</Badge>
              </div>
              <div className="flex justify-between">
                <span>Großbuchstaben erforderlich</span>
                <Badge variant="default">Ja</Badge>
              </div>
              <div className="flex justify-between">
                <span>Sonderzeichen erforderlich</span>
                <Badge variant="default">Ja</Badge>
              </div>
              <div className="flex justify-between">
                <span>Passwort-Ablauf</span>
                <Badge variant="secondary">90 Tage</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Richtlinien bearbeiten
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Zwei-Faktor-Authentifizierung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">73%</div>
              <div className="text-sm text-gray-600">Benutzer mit 2FA</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>SMS</span>
                <Badge>45 Benutzer</Badge>
              </div>
              <div className="flex justify-between">
                <span>Authenticator App</span>
                <Badge>32 Benutzer</Badge>
              </div>
            </div>
            <Button className="w-full">
              2FA für alle aktivieren
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zugriffsprotokoll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{log.user}</div>
                    <div className="text-sm text-gray-600">{log.action}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{log.time}</span>
                  <Badge variant={log.status === "Erfolgreich" ? "default" : "destructive"}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessManagement;
