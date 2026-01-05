import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface CostCenterStatusBadgeProps {
  status: 'normal' | 'warning' | 'critical';
}

export const CostCenterStatusBadge: React.FC<CostCenterStatusBadgeProps> = ({ status }) => {
  const config = {
    normal: {
      label: 'Im Plan',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    warning: {
      label: 'Warnung',
      icon: AlertCircle,
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    },
    critical: {
      label: 'Kritisch',
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  };

  const { label, icon: Icon, className } = config[status] || config.normal;

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};
