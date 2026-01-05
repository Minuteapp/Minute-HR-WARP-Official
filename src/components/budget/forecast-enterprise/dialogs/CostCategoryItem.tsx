import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostCategoryItemProps {
  name: string;
  amount: number;
  percent: number;
  onClick: () => void;
}

export const CostCategoryItem: React.FC<CostCategoryItemProps> = ({
  name,
  amount,
  percent,
  onClick,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
    >
      <span className="font-medium text-foreground">{name}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="font-medium text-foreground">{formatCurrency(amount)}</span>
          <span className="text-muted-foreground ml-2">({percent}%)</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
};
