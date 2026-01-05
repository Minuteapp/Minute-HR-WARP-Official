
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

const TimeRoundingSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Zeitrundungseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Rundungsregeln für Arbeitszeiten festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeRoundingSettings;
