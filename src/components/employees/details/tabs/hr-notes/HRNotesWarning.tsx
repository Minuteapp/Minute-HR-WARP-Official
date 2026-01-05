import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

export const HRNotesWarning = () => {
  return (
    <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
      <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        Vertrauliche HR-Notizen
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        Diese Notizen sind DSGVO-konform und nur für autorisierte HR-Mitarbeiter 
        und Manager sichtbar. Alle Einträge werden auditiert und können vom 
        Mitarbeiter auf Anfrage eingesehen werden (Art. 15 DSGVO).
      </AlertDescription>
    </Alert>
  );
};
