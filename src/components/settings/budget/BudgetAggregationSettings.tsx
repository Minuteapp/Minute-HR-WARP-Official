
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const BudgetAggregationSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Budgetaggregation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Regeln für die Zusammenfassung und Konsolidierung von Budgets festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetAggregationSettings;
