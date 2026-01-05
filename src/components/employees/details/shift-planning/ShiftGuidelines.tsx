import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export const ShiftGuidelines = () => {
  // Keine Mock-Daten mehr - zeigt leeren Zustand
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Richtlinien
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Info className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Keine Schichtrichtlinien hinterlegt.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Richtlinien können in den Unternehmenseinstellungen definiert werden.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
