
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const GDPRComplianceSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            DSGVO Compliance Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie DSGVO-Compliance-Einstellungen konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRComplianceSettings;
