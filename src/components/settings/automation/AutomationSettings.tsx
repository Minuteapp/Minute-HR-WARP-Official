
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const AutomationSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automatisierung Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie die Automatisierung konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationSettings;
