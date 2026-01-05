
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

const PayrollTaxSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Steuereinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Steuersätze und steuerliche Berechnungsregeln konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollTaxSettings;
