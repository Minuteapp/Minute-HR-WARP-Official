
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const BudgetCurrencySettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budgetwährungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Währungseinstellungen und Umrechnungsregeln für Budgets verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetCurrencySettings;
