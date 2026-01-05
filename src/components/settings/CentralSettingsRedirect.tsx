import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CentralSettingsRedirectProps {
  moduleName: string;
  settingsPath: string;
  description?: string;
}

export const CentralSettingsRedirect = ({ 
  moduleName, 
  settingsPath, 
  description 
}: CentralSettingsRedirectProps) => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-muted rounded-full">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <CardTitle>{moduleName}-Einstellungen</CardTitle>
        <CardDescription>
          {description || `Alle Einstellungen für ${moduleName} wurden in das zentrale Einstellungsmodul verschoben.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Dort können Sie alle Konfigurationen zentral verwalten und haben einen besseren Überblick über alle Systemeinstellungen.
        </p>
        <Button 
          onClick={() => navigate(settingsPath)} 
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Zu den Einstellungen
        </Button>
      </CardContent>
    </Card>
  );
};
