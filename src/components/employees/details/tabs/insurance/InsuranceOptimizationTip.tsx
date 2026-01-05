import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const InsuranceOptimizationTip = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">
        Optimierungsmöglichkeiten
      </AlertTitle>
      <AlertDescription className="text-blue-800">
        Für individuelle Beratung zu Versicherungsoptimierungen und Entgeltumwandlung 
        wenden Sie sich bitte an die HR-Abteilung.
      </AlertDescription>
    </Alert>
  );
};
