
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

const TimeMultiSiteSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Multi-Standort Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Zeiterfassung für mehrere Standorte verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeMultiSiteSettings;
