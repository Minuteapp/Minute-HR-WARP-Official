
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BudgetForecastCardProps {
  project: any;
}

export const BudgetForecastCard = ({ project }: BudgetForecastCardProps) => {
  const budgetPlan = project.budget || 0;
  const budgetSpent = project.budget_spent || 0;
  const budgetForecast = project.budget_forecast || budgetSpent;
  const budgetRemaining = budgetPlan - budgetSpent;

  const forecastDeviation = budgetPlan > 0 
    ? ((budgetForecast - budgetPlan) / budgetPlan) * 100 
    : 0;
  const isOverBudget = forecastDeviation > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Budget & Forecast</CardTitle>
        <p className="text-sm text-muted-foreground">Finanzielle Übersicht und Prognose</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Budget Plan</span>
          <span className="font-medium">{formatCurrency(budgetPlan)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Budget Ist</span>
          <span className="font-medium">{formatCurrency(budgetSpent)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Budget Forecast</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatCurrency(budgetForecast)}</span>
            {forecastDeviation !== 0 && (
              <span className={isOverBudget ? 'text-red-500 text-sm' : 'text-green-500 text-sm'}>
                ({isOverBudget ? '+' : ''}{forecastDeviation.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Verbleibendes Budget</span>
          <span className="font-bold">{formatCurrency(budgetRemaining)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
