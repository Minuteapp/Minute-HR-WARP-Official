import React from 'react';
import { CheckCircle } from 'lucide-react';

interface OptimizationItemProps {
  title: string;
  description: string;
  savingsAmount: number;
  savingsType: string;
}

export const OptimizationItem: React.FC<OptimizationItemProps> = ({
  title,
  description,
  savingsAmount,
  savingsType
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `€ ${(value / 1000).toFixed(0)}k`;
    }
    return `€ ${value.toLocaleString('de-DE')}`;
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <CheckCircle className="h-5 w-5 text-green-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">{formatCurrency(savingsAmount)}</p>
        <p className="text-xs text-muted-foreground">{savingsType}</p>
      </div>
    </div>
  );
};
