import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Info } from "lucide-react";

export const ShiftAIRecommendations = () => {
  // Keine Mock-Daten mehr - zeigt leeren Zustand
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          KI-Empfehlungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Info className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Noch keine KI-Empfehlungen verfügbar.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Empfehlungen werden basierend auf Schichthistorie generiert.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
