
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

export const ComplianceAlerts = () => {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Arbeitszeitgesetz eingehalten</AlertTitle>
        <AlertDescription>
          Alle Mitarbeiter halten die gesetzlichen Arbeitszeiten ein.
        </AlertDescription>
      </Alert>

      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Pausenzeiten-Warnung</AlertTitle>
        <AlertDescription>
          2 Mitarbeiter haben ihre Pausenzeiten nicht vollständig eingehalten.
        </AlertDescription>
      </Alert>
    </div>
  );
};
