
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const BudgetIntervalSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Budgetintervalle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Budgetperioden und Planungsintervalle festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetIntervalSettings;
