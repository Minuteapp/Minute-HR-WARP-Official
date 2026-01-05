import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetCategory {
  category: string;
  budget: number;
  actual: number;
}

interface BudgetCategoryBarsProps {
  categories: BudgetCategory[];
}

export const BudgetCategoryBars = ({ categories }: BudgetCategoryBarsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget-Auslastung nach Kategorie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Kategorien vorhanden
          </p>
        ) : (
          categories.map((cat) => {
            const percentage = cat.budget > 0 ? (cat.actual / cat.budget) * 100 : 0;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={cat.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className={isOverBudget ? "text-destructive" : "text-muted-foreground"}>
                    {formatCurrency(cat.actual)} / {formatCurrency(cat.budget)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
