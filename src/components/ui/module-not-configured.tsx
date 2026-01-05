import { AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ModuleNotConfiguredProps {
  moduleName: string;
  requiredSettings: string[];
  settingsPath: string;
  description?: string;
}

/**
 * ZERO-DATA-START: Empty State für nicht konfigurierte Module
 * 
 * Zeigt einen klaren Hinweis, dass das Modul noch nicht konfiguriert ist
 * und verlinkt direkt zu den relevanten Einstellungen.
 */
export function ModuleNotConfigured({
  moduleName,
  requiredSettings,
  settingsPath,
  description
}: ModuleNotConfiguredProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-lg w-full border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">
            {moduleName} ist noch nicht konfiguriert
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {description || 
              `Dieses Modul benötigt einige Einstellungen, bevor es verwendet werden kann.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredSettings.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Folgende Einstellungen werden benötigt:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {requiredSettings.map((setting, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {setting}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button 
            onClick={() => navigate(settingsPath)} 
            className="w-full"
            size="lg"
          >
            <Settings className="mr-2 h-4 w-4" />
            Zu Einstellungen wechseln
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Kompaktere Variante für Inline-Nutzung in Tabs oder Abschnitten
 */
export function ModuleNotConfiguredInline({
  moduleName,
  requiredSettings,
  settingsPath
}: Omit<ModuleNotConfiguredProps, 'description'>) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {moduleName} nicht verfügbar
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        Bitte legen Sie zuerst {requiredSettings.join(', ')} in den Einstellungen an.
      </p>
      <Button 
        variant="outline" 
        onClick={() => navigate(settingsPath)}
      >
        <Settings className="mr-2 h-4 w-4" />
        Einstellungen öffnen
      </Button>
    </div>
  );
}
