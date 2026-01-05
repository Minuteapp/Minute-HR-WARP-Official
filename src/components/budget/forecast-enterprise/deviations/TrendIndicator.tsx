import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'rising' | 'falling' | 'stable';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  const config = {
    rising: {
      icon: TrendingUp,
      label: 'Steigend',
      className: 'text-red-600 dark:text-red-400'
    },
    falling: {
      icon: TrendingDown,
      label: 'Sinkend',
      className: 'text-green-600 dark:text-green-400'
    },
    stable: {
      icon: Minus,
      label: 'Stabil',
      className: 'text-muted-foreground'
    }
  };

  const { icon: Icon, label, className } = config[trend] || config.stable;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon className="h-4 w-4" />
      <span className="text-xs">{label}</span>
    </div>
  );
};
