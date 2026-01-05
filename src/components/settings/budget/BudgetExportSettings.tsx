
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

const BudgetExportSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Budgetexport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Einstellungen für den Export von Budgetdaten konfigurieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetExportSettings;
