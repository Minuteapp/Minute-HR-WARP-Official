
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PayrollGdprSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            DSGVO-Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie DSGVO-konforme Einstellungen für Lohndaten verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollGdprSettings;
