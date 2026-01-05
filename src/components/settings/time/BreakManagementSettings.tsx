
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";

const BreakManagementSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Pausenverwaltung Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie die Einstellungen für die Pausenverwaltung konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreakManagementSettings;
