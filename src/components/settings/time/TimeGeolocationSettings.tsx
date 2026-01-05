
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const TimeGeolocationSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Standortbasierte Zeiterfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie GPS- und standortbasierte Zeiterfassungsregeln konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeGeolocationSettings;
