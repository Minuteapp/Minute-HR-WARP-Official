import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface Entity {
  id: string;
  name: string;
  country: string;
  employees: number;
}

interface ComplianceReportingCenterProps {
  entities: Entity[];
  selectedCurrency: string;
}

export const ComplianceReportingCenter: React.FC<ComplianceReportingCenterProps> = ({
  entities,
  selectedCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Compliance & Reporting Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          DSGVO-konforme Berichterstattung und Audit-Trail für {entities.length} Entitäten.
        </p>
      </CardContent>
    </Card>
  );
};