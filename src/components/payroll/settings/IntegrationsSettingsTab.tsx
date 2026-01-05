import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, CheckCircle, XCircle } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

const integrations: Integration[] = [
  { id: "1", name: "DATEV", description: "Export von Lohnabrechnungen und Buchungen", connected: true },
  { id: "2", name: "SAP HCM", description: "Synchronisation von Personalstammdaten", connected: false },
  { id: "3", name: "Personio", description: "HR-Datenintegration", connected: false },
  { id: "4", name: "Microsoft 365", description: "Kalender- und Teams-Integration", connected: true },
];

export const IntegrationsSettingsTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Schnittstellen</h2>
        <p className="text-sm text-muted-foreground">Verwalten Sie Verbindungen zu externen Systemen</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Link2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                {integration.connected ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verbunden
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nicht verbunden
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
              <Button 
                variant={integration.connected ? "outline" : "default"}
                className="w-full"
              >
                {integration.connected ? "Konfigurieren" : "Verbinden"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
