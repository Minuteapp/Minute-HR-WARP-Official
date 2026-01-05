
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, Target, AlertTriangle, FileText, BarChart3 } from "lucide-react";
import { BudgetOverview } from './BudgetOverview';
import { BudgetForecastPanel } from './BudgetForecastPanel';
import { BudgetTemplatesList } from './BudgetTemplatesList';
import { ForecastTemplatesTab } from './forecast-templates/ForecastTemplatesTab';
import { ExecutiveBudgetCockpit } from './executive/ExecutiveBudgetCockpit';
import { CreateBudgetDialog } from './CreateBudgetDialog';
import { Button } from "@/components/ui/button";
import { useBudgetPlans } from '@/hooks/useBudget';

export const BudgetDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: budgets } = useBudgetPlans();

  // Berechne echte Statistiken basierend auf vorhandenen Budgets
  const totalAmount = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
  const usedAmount = budgets?.reduce((sum, budget) => sum + budget.used_amount, 0) || 0;
  const remainingAmount = totalAmount - usedAmount;
  const alertsCount = budgets?.filter(budget => budget.remaining_amount < budget.amount * 0.2).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget & Forecast</h1>
          <p className="text-sm text-gray-500">Umfassende Budgetplanung und Prognosen für Geschäftsführer</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Neues Budget erstellen
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbudget</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              {budgets?.length || 0} aktive Budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verbrauchte Mittel</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(usedAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              {totalAmount > 0 ? Math.round((usedAmount / totalAmount) * 100) : 0}% des Budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verbleibendes Budget</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(remainingAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Verfügbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnungen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsCount}</div>
            <p className="text-xs text-muted-foreground">Budgetüberschreitungen</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="enterprise">
            <BarChart3 className="h-4 w-4 mr-1" />
            Enterprise
          </TabsTrigger>
          <TabsTrigger value="forecast">Prognosen</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="forecast-templates">
            <FileText className="h-4 w-4 mr-1" />
            F-Vorlagen
          </TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BudgetOverview />
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-6">
          <ExecutiveBudgetCockpit />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <BudgetForecastPanel />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <BudgetTemplatesList />
        </TabsContent>

        <TabsContent value="forecast-templates" className="space-y-6">
          <ForecastTemplatesTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget-Analysen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10">
                Erweiterte Budget-Analysen und KI-basierte Insights werden hier angezeigt.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateBudgetDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
