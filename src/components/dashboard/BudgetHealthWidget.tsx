import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { useBudgetHealthMetrics } from "@/hooks/useBudgetHealthMetrics";

const BudgetHealthWidget = () => {
  const { data: healthMetrics, isLoading } = useBudgetHealthMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget-Gesundheit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Berechne Gesamtgesundheitswerte
  const overallHealth = healthMetrics?.reduce((acc, metric) => {
    acc.totalScore += metric.health_score || 0;
    acc.count += 1;
    return acc;
  }, { totalScore: 0, count: 0 });

  const averageHealth = overallHealth?.count > 0 ? 
    Math.round(overallHealth.totalScore / overallHealth.count) : 0;

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const criticalBudgets = healthMetrics?.filter(metric => 
    metric.risk_level === 'critical' || metric.health_score < 40
  ) || [];

  const warningBudgets = healthMetrics?.filter(metric => 
    metric.risk_level === 'high' || (metric.health_score >= 40 && metric.health_score < 60)
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Budget-Gesundheit
          {getHealthIcon(averageHealth)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gesamtgesundheit */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Gesamtgesundheit</span>
            <span className={`text-lg font-bold ${getHealthColor(averageHealth)}`}>
              {averageHealth}%
            </span>
          </div>
          <Progress value={averageHealth} className="h-2" />
        </div>

        {/* Kritische Budgets */}
        {criticalBudgets.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Kritische Budgets ({criticalBudgets.length})
              </span>
            </div>
            <div className="space-y-1">
              {criticalBudgets.slice(0, 3).map((budget, index) => (
                <div key={index} className="text-xs text-red-700">
                  • {budget.dimension_type} - {budget.health_score}% Gesundheit
                </div>
              ))}
              {criticalBudgets.length > 3 && (
                <div className="text-xs text-red-600">
                  +{criticalBudgets.length - 3} weitere...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warnungen */}
        {warningBudgets.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Beobachtung erforderlich ({warningBudgets.length})
              </span>
            </div>
          </div>
        )}

        {/* Risiko-Level-Verteilung */}
        <div>
          <span className="text-sm font-medium mb-2 block">Risiko-Verteilung</span>
          <div className="flex flex-wrap gap-1">
            {['low', 'medium', 'high', 'critical'].map(level => {
              const count = healthMetrics?.filter(m => m.risk_level === level).length || 0;
              if (count === 0) return null;
              
              return (
                <Badge key={level} variant="secondary" className={getRiskBadgeColor(level)}>
                  {level}: {count}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-2 text-xs">
            <button className="text-blue-600 hover:underline">
              Details anzeigen
            </button>
            <button className="text-blue-600 hover:underline">
              Bericht erstellen
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetHealthWidget;
