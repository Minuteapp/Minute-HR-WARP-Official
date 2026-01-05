import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CostDeviationCellProps {
  budgetAmount: number;
  actualAmount: number;
}

export const CostDeviationCell = ({ budgetAmount, actualAmount }: CostDeviationCellProps) => {
  const deviation = actualAmount - budgetAmount;
  const percentage = budgetAmount > 0 ? ((deviation / budgetAmount) * 100) : 0;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absValue);
  };

  if (Math.abs(deviation) < 1) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span>0 €</span>
      </div>
    );
  }

  if (deviation > 0) {
    return (
      <div className="flex items-center gap-1 text-destructive">
        <TrendingUp className="h-4 w-4" />
        <span>+{formatCurrency(deviation)}</span>
        <span className="text-xs">({percentage.toFixed(1)}%)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-green-600">
      <TrendingDown className="h-4 w-4" />
      <span>-{formatCurrency(deviation)}</span>
      <span className="text-xs">({Math.abs(percentage).toFixed(1)}%)</span>
    </div>
  );
};
