import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const SustainabilitySocialList = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Soziale Verantwortung
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-6">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Keine Daten verfügbar</p>
        <p className="text-xs text-muted-foreground">
          Soziale Kennzahlen werden nach Erfassung hier angezeigt.
        </p>
      </div>
    </CardContent>
  </Card>
);
