
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplianceAlerts } from "./compliance/ComplianceAlerts";
import { ComplianceMetrics } from "./compliance/ComplianceMetrics";

interface ComplianceReportProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

export const ComplianceReport = ({ period }: ComplianceReportProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Compliance-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ComplianceAlerts />
          <ComplianceMetrics period={period} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceReport;
