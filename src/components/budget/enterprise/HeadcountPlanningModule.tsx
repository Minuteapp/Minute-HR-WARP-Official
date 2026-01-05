import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

interface HeadcountPlanningModuleProps {
  selectedEntity: string;
  selectedCurrency: string;
}

export const HeadcountPlanningModule: React.FC<HeadcountPlanningModuleProps> = ({
  selectedEntity,
  selectedCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Headcount Planning - {selectedEntity.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          Detaillierte Headcount-Planung mit Gehalts-, Bonus- und Benefitdaten wird hier angezeigt.
        </p>
      </CardContent>
    </Card>
  );
};