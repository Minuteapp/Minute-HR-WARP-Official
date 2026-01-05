import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface BudgetStats {
  plannedBudget: number;
  actualExpenses: number;
  actualExpensesDeviation: number;
  forecast: number;
  forecastDeviation: number;
  projectsOverBudget: number;
  forecastRisk: number;
}

interface BudgetStatsCardsProps {
  stats: BudgetStats;
}

const BudgetStatsCards = ({ stats }: BudgetStatsCardsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}k`;
    }
    return `€${value}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Geplantes Budget</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.plannedBudget)}</p>
          <p className="text-xs text-muted-foreground mt-1">Portfolio gesamt</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">IST-Ausgaben</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.actualExpenses)}</p>
          <div className="flex items-center gap-1 mt-1">
            {stats.actualExpensesDeviation < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">{stats.actualExpensesDeviation}%</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">+{stats.actualExpensesDeviation}%</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Forecast</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.forecast)}</p>
          <div className="flex items-center gap-1 mt-1">
            {stats.forecastDeviation < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">{stats.forecastDeviation}%</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">+{stats.forecastDeviation}%</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <p className="text-sm text-muted-foreground">Projekte über Budget</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-orange-500">{stats.projectsOverBudget}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.forecastRisk} Forecast-Risiko</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetStatsCards;
