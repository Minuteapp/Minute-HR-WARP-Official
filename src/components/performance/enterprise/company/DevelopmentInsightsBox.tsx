import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, GraduationCap } from "lucide-react";

export function DevelopmentInsightsBox() {
  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Entwicklungs-Insights</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Basierend auf den aktuellen Performance-Daten werden automatisch 
              Entwicklungsempfehlungen generiert.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <TrendingUp className="h-4 w-4" />
                <span>Potenzialanalyse verfügbar</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <GraduationCap className="h-4 w-4" />
                <span>Schulungsempfehlungen aktiv</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
