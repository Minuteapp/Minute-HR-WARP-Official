
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface ExecutiveSummaryProps {
  activeCount: number;
  countryCount: number;
  criticalDeadlines: number;
  costOverBudget: number;
  complianceRisks: number;
}

export const ExecutiveSummary = ({
  activeCount,
  countryCount,
  criticalDeadlines,
  costOverBudget,
  complianceRisks
}: ExecutiveSummaryProps) => {
  const summaryText = `Aktuell ${activeCount} aktive Entsendungen über ${countryCount} Länder. In ${criticalDeadlines} Fällen laufen Visa innerhalb von 60 Tagen aus. Die durchschnittlichen Kosten pro Entsendung liegen ${costOverBudget}% über dem Budget. ${complianceRisks} kritische Compliance-Risiken erfordern sofortige Aufmerksamkeit.`;

  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">KI-Executive Summary:</p>
            <p className="text-sm text-foreground">{summaryText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
