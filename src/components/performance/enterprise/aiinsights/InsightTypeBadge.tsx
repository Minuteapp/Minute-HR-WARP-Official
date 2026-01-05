import React from 'react';
import { Badge } from '@/components/ui/badge';

interface InsightTypeBadgeProps {
  type: 'warning' | 'pattern' | 'suggestion' | 'summary';
}

export const InsightTypeBadge: React.FC<InsightTypeBadgeProps> = ({ type }) => {
  const config = {
    warning: {
      label: 'Warnung',
      className: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
    },
    pattern: {
      label: 'Muster erkannt',
      className: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
    },
    suggestion: {
      label: 'Vorschlag',
      className: 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400'
    },
    summary: {
      label: 'Zusammenfassung',
      className: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  };

  const { label, className } = config[type];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
