
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const CalendarSyncSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Kalendersynchronisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie die Synchronisation mit externen Kalendern konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSyncSettings;
