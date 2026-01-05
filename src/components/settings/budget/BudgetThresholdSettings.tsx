
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const BudgetThresholdSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Budgetgrenzen & Warnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Warnschwellen und Überschreitungsregeln für Budgets festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetThresholdSettings;
