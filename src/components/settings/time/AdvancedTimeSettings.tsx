
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const AdvancedTimeSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Erweiterte Zeiteinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie erweiterte Einstellungen für die Zeiterfassung konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedTimeSettings;
