
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

const PayrollAccessSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Zugriffskontrolle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Zugriffsberechtigungen für Lohndaten und -funktionen verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollAccessSettings;
