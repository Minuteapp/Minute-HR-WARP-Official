
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const TimePayrollSyncSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Lohnabrechnung-Synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie die Synchronisation zwischen Zeiterfassung und Lohnabrechnung konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimePayrollSyncSettings;
