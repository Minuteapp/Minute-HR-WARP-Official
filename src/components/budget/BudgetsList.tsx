import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudgets } from '@/hooks/useBudgets';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, User } from "lucide-react";

export const BudgetsList = () => {
  const { data: budgets, isLoading } = useBudgets();

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
          <CardTitle>Budget-Liste</CardTitle>
          <CardDescription>
            Hier werden alle verfügbaren Budgets angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-muted-foreground">
            Noch keine Budgets vorhanden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Alle Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const usagePercent = budget.amount > 0 ? (budget.used_amount / budget.amount) * 100 : 0;
          const isOverBudget = usagePercent > 100;
          const isWarning = usagePercent > 80 && usagePercent <= 100;
          
          return (
            <Card key={budget.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{budget.name}</CardTitle>
                  <Badge variant={
                    budget.status === 'active' ? 'default' : 
                    budget.status === 'completed' ? 'secondary' : 
                    budget.status === 'cancelled' ? 'destructive' : 'outline'
                  }>
                    {budget.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  {budget.type}
                  {(isOverBudget || isWarning) && (
                    <AlertTriangle className="h-4 w-4 text-warning ml-1" />
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verbrauch</span>
                    <span className={`font-medium ${isOverBudget ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'}`}>
                      {usagePercent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(usagePercent, 100)} 
                    className="h-2"
                    // @ts-ignore - Progress component accepts custom props
                    indicatorClassName={isOverBudget ? 'bg-destructive' : isWarning ? 'bg-warning' : undefined}
                  />
                </div>

                {/* Financial Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{budget.currency} {budget.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verbraucht:</span>
                    <span className="font-medium">{budget.currency} {budget.used_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verfügbar:</span>
                    <div className="flex items-center gap-1">
                      {budget.remaining_amount >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`font-medium ${budget.remaining_amount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {budget.currency} {Math.abs(budget.remaining_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-2 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  {budget.assigned_to_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{budget.assigned_to_name}</span>
                    </div>
                  )}
                  {budget.department && (
                    <div>
                      <span className="font-medium">Abteilung:</span> {budget.department}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Details
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    Bearbeiten
                  </Button>
                </div>
              </CardContent>
              
              {/* Status Indicator */}
              {isOverBudget && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-destructive">
                  <AlertTriangle className="h-3 w-3 text-white absolute -top-4 -right-3" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};