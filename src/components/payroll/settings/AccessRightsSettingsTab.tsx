import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Lock } from "lucide-react";

export const AccessRightsSettingsTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Zugriffsrechte</h2>
        <p className="text-sm text-muted-foreground">Konfigurieren Sie Rollen und Berechtigungen für das Payroll-Modul</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Administrator</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Voller Zugriff auf alle Payroll-Funktionen inkl. Einstellungen und Genehmigungen.
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">HR Manager</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kann Abrechnungen erstellen und bearbeiten, keine Zugriff auf Systemeinstellungen.
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Mitarbeiter</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kann nur eigene Gehaltsabrechnungen und Benefits einsehen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
