
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const PayrollPaymentSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Zahlungseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Zahlungsmethoden und Überweisungsregeln für Löhne konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollPaymentSettings;
