
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const TimeComplianceSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Arbeitszeit-Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie gesetzliche Compliance-Regeln für Arbeitszeiten verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeComplianceSettings;
