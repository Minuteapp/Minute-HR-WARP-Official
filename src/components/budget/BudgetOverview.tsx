
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudgetPlans } from '@/hooks/useBudget';
import { Skeleton } from "@/components/ui/skeleton";

export const BudgetOverview = () => {
  const { data: budgets, isLoading } = useBudgetPlans();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget-Übersicht</CardTitle>
          <CardDescription>
            Hier werden Ihre Budgets angezeigt, sobald Sie welche erstellt haben.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-muted-foreground">
            Noch keine Budgets vorhanden. Erstellen Sie Ihr erstes Budget über den Button oben.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Aktuelle Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle className="text-lg">{budget.name}</CardTitle>
              <CardDescription>{budget.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium">{budget.currency} {budget.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verbraucht:</span>
                  <span className="font-medium">{budget.currency} {budget.used_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verbleibend:</span>
                  <span className="font-medium text-green-600">
                    {budget.currency} {budget.remaining_amount.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Zeitraum: {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
