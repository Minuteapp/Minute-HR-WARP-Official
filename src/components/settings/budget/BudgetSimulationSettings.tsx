
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const BudgetSimulationSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budgetsimulationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Parameter für Budgetprognosen und Simulationen konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSimulationSettings;
