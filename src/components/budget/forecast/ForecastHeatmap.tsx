
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useForecastHeatmap } from '@/hooks/useBudgetScenarios';

interface ForecastHeatmapProps {
  budgetPlanId: string;
}

export const ForecastHeatmap = ({ budgetPlanId }: ForecastHeatmapProps) => {
  const { data: heatmapData, isLoading } = useForecastHeatmap(budgetPlanId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Forecast-Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!heatmapData || heatmapData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Forecast-Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Forecast-Daten verfügbar</p>
            <p className="text-sm">Erstellen Sie zuerst einen Budget-Plan mit Forecast-Daten.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-white" />;
      case 'warning': case 'critical': return <AlertTriangle className="h-4 w-4 text-white" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Forecast-Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {heatmapData.map((item, index) => (
              <div
                key={index}
                className={`${getStatusColor(item.status)} relative p-3 rounded-lg text-white text-center transition-all hover:scale-105 cursor-pointer`}
                title={`${item.period}: €${item.value.toLocaleString('de-DE')} (${(item.confidence * 100).toFixed(0)}% Konfidenz)`}
              >
                <div className="text-xs font-medium">
                  {item.period.split('-')[1]}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {getStatusIcon(item.status)}
                </div>
                <div className="text-xs mt-1">
                  €{Math.abs(item.value / 1000).toFixed(0)}k
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30 rounded-b-lg">
                  <div 
                    className="h-full bg-white rounded-b-lg"
                    style={{ width: `${item.confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Positiv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Warnung</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Kritisch</span>
              </div>
            </div>
            <div className="text-gray-500">
              Konfidenz: Balken am unteren Rand
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
