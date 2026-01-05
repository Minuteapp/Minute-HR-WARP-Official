
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const PayrollAllowanceSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Zulagen & Abzüge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie verschiedene Zulagen, Abzüge und Sonderregelungen verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollAllowanceSettings;
