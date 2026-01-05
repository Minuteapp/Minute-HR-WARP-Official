
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const TimeReminderSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Zeiterinnerungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Erinnerungen für Zeiterfassung konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeReminderSettings;
