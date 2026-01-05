import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CriticalCostCenterItemProps {
  name: string;
  responsible: string;
  deviationAmount: number;
  deviationPercent: number;
  status: 'critical' | 'warning' | 'under_budget' | 'normal';
}

export const CriticalCostCenterItem: React.FC<CriticalCostCenterItemProps> = ({
  name,
  responsible,
  deviationAmount,
  deviationPercent,
  status,
}) => {
  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}€${Math.abs(value).toLocaleString('de-DE')}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          iconColor: 'text-red-500',
          icon: AlertTriangle,
          label: 'über Budget',
        };
      case 'warning':
        return {
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          iconColor: 'text-orange-500',
          icon: AlertTriangle,
          label: 'über Budget',
        };
      case 'under_budget':
        return {
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          iconColor: 'text-green-500',
          icon: CheckCircle,
          label: 'unter Budget',
        };
      default:
        return {
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          iconColor: 'text-muted-foreground',
          icon: CheckCircle,
          label: 'im Budget',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg border', config.bgColor, config.borderColor)}>
      <div className="flex items-center gap-3">
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.iconColor)} />
        </div>
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{responsible}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn('font-semibold', status === 'under_budget' ? 'text-green-600' : status === 'normal' ? 'text-foreground' : 'text-red-600')}>
          {formatCurrency(deviationAmount)}
        </p>
        <p className="text-sm text-muted-foreground">
          {Math.abs(deviationPercent).toFixed(1)}% {config.label}
        </p>
      </div>
    </div>
  );
};
