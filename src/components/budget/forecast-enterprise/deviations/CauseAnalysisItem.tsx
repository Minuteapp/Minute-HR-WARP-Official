import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Cause {
  description: string;
  impact_amount: number;
}

interface CauseAnalysisItemProps {
  category: string;
  deviationPercent: number;
  deviationAmount: number;
  severity: 'critical' | 'warning';
  causes: Cause[];
}

export const CauseAnalysisItem: React.FC<CauseAnalysisItemProps> = ({
  category,
  deviationPercent,
  deviationAmount,
  severity,
  causes
}) => {
  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    if (Math.abs(value) >= 1000000) return `${prefix}€ ${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${prefix}€ ${(value / 1000).toFixed(0)}k`;
    return `${prefix}€ ${value.toFixed(0)}`;
  };

  const borderColor = severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500';
  const badgeConfig = severity === 'critical' 
    ? { label: 'Kritisch', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    : { label: 'Warnung', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };

  return (
    <div className={`border-l-4 ${borderColor} bg-card rounded-r-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{category}</h4>
            <span className="text-sm text-muted-foreground">
              ({deviationPercent > 0 ? '+' : ''}{deviationPercent.toFixed(1)}%)
            </span>
            <Badge variant="outline" className={badgeConfig.className}>
              {badgeConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Abweichung: {formatCurrency(deviationAmount)}
          </p>
        </div>
      </div>

      {causes.length > 0 && (
        <ul className="space-y-2">
          {causes.map((cause, index) => (
            <li key={index} className="flex items-start justify-between text-sm">
              <span className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{cause.description}</span>
              </span>
              <span className={`font-medium ${cause.impact_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(cause.impact_amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
