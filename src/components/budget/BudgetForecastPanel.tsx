
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Target, AlertCircle } from "lucide-react";
import { useForecastTemplates } from '@/hooks/useForecastTemplates';
import { useBudgetPlans } from '@/hooks/useBudget';
import { BudgetForecastDashboard } from './forecast/BudgetForecastDashboard';

export const BudgetForecastPanel = () => {
  const { data: templates, isLoading: templatesLoading } = useForecastTemplates();
  const { data: budgets, isLoading: budgetsLoading } = useBudgetPlans();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const isLoading = templatesLoading || budgetsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Zeige das vollständige Budget Forecasting Dashboard
  return <BudgetForecastDashboard />;
};
