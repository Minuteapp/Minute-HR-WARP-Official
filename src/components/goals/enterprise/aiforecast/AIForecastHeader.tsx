import { Brain } from "lucide-react";

export const AIForecastHeader = () => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">KI-Insights & Forecasts</h2>
      </div>
      <p className="text-muted-foreground">
        KI-gestützte Analysen, Prognosen und Empfehlungen
      </p>
    </div>
  );
};
