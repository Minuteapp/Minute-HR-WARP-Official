
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const TimeTrackingRules = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeiterfassung Regeln
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie die Regeln für die Zeiterfassung konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingRules;
