import React from 'react';
import { Badge } from '@/components/ui/badge';

interface InsightPriorityBadgeProps {
  priority: 'high' | 'medium' | 'info';
}

export const InsightPriorityBadge: React.FC<InsightPriorityBadgeProps> = ({ priority }) => {
  const config = {
    high: {
      label: 'Hohe Priorität',
      className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
    },
    medium: {
      label: 'Mittlere Priorität',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    },
    info: {
      label: 'Info',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
    }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
};
