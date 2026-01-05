
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw } from "lucide-react";

export const ModuleIntegrationPanel = () => {
  const integrations = [
    { name: "Zeiterfassung", status: "connected", lastSync: "Vor 5 Min" },
    { name: "Projekte", status: "connected", lastSync: "Vor 2 Std" },
    { name: "Personal", status: "pending", lastSync: "Nie" },
    { name: "Buchhaltung", status: "error", lastSync: "Vor 1 Tag" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Modul-Integrationen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{integration.name}</h4>
                <p className="text-sm text-gray-500">Letzte Sync: {integration.lastSync}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(integration.status)}>
                  {integration.status === 'connected' ? 'Verbunden' : 
                   integration.status === 'pending' ? 'Ausstehend' : 'Fehler'}
                </Badge>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
