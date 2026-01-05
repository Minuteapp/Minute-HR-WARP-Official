import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AIForecastCardProps {
  predictedFTE?: number;
  basedOnProjects?: number;
  basedOnHistory?: number;
}

export const AIForecastCard = ({ predictedFTE, basedOnProjects, basedOnHistory }: AIForecastCardProps) => {
  const hasData = predictedFTE !== undefined;

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">KI-Bedarfsschätzung</h3>
            {hasData ? (
              <p className="text-sm text-purple-700 mt-1">
                Basierend auf historischen Daten und geplanten Projekten prognostizieren wir einen 
                zusätzlichen Bedarf von <span className="font-bold">{predictedFTE} FTE</span> in den 
                nächsten 12 Monaten. Davon {basedOnProjects} FTE aus Projekten und {basedOnHistory} FTE 
                aus Fluktuationsersatz.
              </p>
            ) : (
              <p className="text-sm text-purple-700 mt-1">
                Sobald Bedarfsdaten erfasst werden, wird hier eine KI-gestützte Prognose angezeigt.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
