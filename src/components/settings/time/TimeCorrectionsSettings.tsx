
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";

const TimeCorrectionsSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Zeitkorrekturen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Regeln für Zeitkorrekturen und nachträgliche Änderungen festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeCorrectionsSettings;
