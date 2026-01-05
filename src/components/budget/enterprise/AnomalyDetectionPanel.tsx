import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AnomalyDetectionPanelProps {
  selectedEntity: string;
  selectedCurrency: string;
}

export const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({
  selectedEntity,
  selectedCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Anomaly Detection - {selectedEntity.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          Automatische Erkennung von Budgetabweichungen und Anomalien mit KI-Alerts.
        </p>
      </CardContent>
    </Card>
  );
};