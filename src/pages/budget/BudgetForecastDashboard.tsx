
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBudgets } from '@/hooks/useBudgets';
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PieChart, Target, AlertTriangle } from "lucide-react";

export const BudgetForecastDashboard = () => {
  const { data: budgets, isLoading } = useBudgets();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
  const usedBudget = budgets?.reduce((sum, budget) => sum + budget.used_amount, 0) || 0;
  const remainingBudget = totalBudget - usedBudget;
  const budgetAlerts = budgets?.filter(budget => budget.remaining_amount < budget.amount * 0.2).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Budget Forecast Dashboard</h1>
        <p className="text-sm text-gray-500">Übersicht und Prognosen für alle Budget-Bereiche</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbudget</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalBudget / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">
              {budgets?.length || 0} aktive Budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verbraucht</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(usedBudget / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0}% des Budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verbleibend</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(remainingBudget / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">Verfügbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnungen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetAlerts}</div>
            <p className="text-xs text-muted-foreground">Kritische Budgets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="forecasts">Prognosen</TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget-Übersicht</CardTitle>
              <CardDescription>
                Aktuelle Budget-Verteilung und Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budgets && budgets.length > 0 ? (
                <div className="space-y-4">
                  {budgets.slice(0, 5).map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{budget.name}</h4>
                        <p className="text-sm text-muted-foreground">{budget.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{budget.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((budget.used_amount / budget.amount) * 100)}% verbraucht
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Keine Budget-Daten verfügbar
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget-Prognosen</CardTitle>
              <CardDescription>
                Zukünftige Budget-Entwicklung und Trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Prognose-Features werden implementiert
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget-Analysen</CardTitle>
              <CardDescription>
                Detaillierte Analyse der Budget-Performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Analyse-Features werden implementiert
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
