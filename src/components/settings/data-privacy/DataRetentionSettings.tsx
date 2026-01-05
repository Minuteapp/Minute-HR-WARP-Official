
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive } from "lucide-react";

const DataRetentionSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Datenaufbewahrung Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Datenaufbewahrungsrichtlinien konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRetentionSettings;
