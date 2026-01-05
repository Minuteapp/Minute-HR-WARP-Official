
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface CompanyNotFoundProps {
  onBack: () => void;
  onRetry?: () => void;
  error?: Error | null;
}

export const CompanyNotFound = ({ onBack, onRetry, error }: CompanyNotFoundProps) => {
  // Loggen wir das Problem, um zu verstehen, wann es auftritt
  useEffect(() => {
    console.log("CompanyNotFound component rendered", { error });
  }, [error]);

  return (
    <Card className="p-6">
      <div className="text-center py-10">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-lg font-medium">Firma nicht gefunden</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Die angeforderte Firma konnte nicht gefunden werden. 
          Dies kann folgende Gründe haben:
        </p>
        <ul className="text-muted-foreground mt-2 list-disc text-left max-w-md mx-auto">
          <li>Die Firma existiert nicht in der Datenbank</li>
          <li>Die Firma wurde gelöscht oder deaktiviert</li>
          <li>Es liegt ein technisches Problem mit der Datenbankverbindung vor</li>
        </ul>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md max-w-md mx-auto text-left">
            <p className="font-semibold">Technische Details:</p>
            <p className="font-mono text-xs break-all overflow-auto max-h-24">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="mt-6 space-x-2">
          <Button onClick={onBack} variant="outline">
            Zurück zur Übersicht
          </Button>
          
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
