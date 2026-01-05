
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetDeviation {
  department: string;
  actual: number;
  planned: number;
  deviationPercent: number;
}

interface BudgetDeviationListProps {
  data: BudgetDeviation[];
}

const BudgetDeviationList = ({ data }: BudgetDeviationListProps) => {
  const hasData = data.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Abteilungsübersicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{item.department}</p>
                  <p className="text-sm text-muted-foreground">
                    €{item.actual.toLocaleString('de-DE')} / €{item.planned.toLocaleString('de-DE')}
                  </p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  item.deviationPercent < 0 ? "text-green-600" : "text-red-600"
                )}>
                  {item.deviationPercent < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>{item.deviationPercent > 0 ? '+' : ''}{item.deviationPercent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Keine Abteilungsdaten verfügbar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetDeviationList;
