
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const BudgetApprovalSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Budgetgenehmigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Genehmigungsworkflows für Budgetanpassungen festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetApprovalSettings;
