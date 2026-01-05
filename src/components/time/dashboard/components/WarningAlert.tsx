
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WarningAlertProps {
  message: string;
}

const WarningAlert = ({ message }: WarningAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Achtung</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default WarningAlert;
