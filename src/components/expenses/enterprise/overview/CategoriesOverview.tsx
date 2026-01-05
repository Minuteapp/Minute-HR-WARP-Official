
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CategoryData {
  name: string;
  transactions: number;
  amount: number;
  percentage: number;
}

interface CategoriesOverviewProps {
  categories?: CategoryData[];
  totalTransactions?: number;
}

const CategoriesOverview = ({ categories = [], totalTransactions = 0 }: CategoriesOverviewProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Kategorien-Übersicht {totalTransactions > 0 ? `(${totalTransactions.toLocaleString()} Transaktionen)` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{category.name}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{category.transactions.toLocaleString()} Transaktionen</span>
                    <span className="font-medium text-foreground">{formatCurrency(category.amount)}</span>
                    <span className="w-12 text-right">{category.percentage}%</span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Keine Kategoriedaten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesOverview;
