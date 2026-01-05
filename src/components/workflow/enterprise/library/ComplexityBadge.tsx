import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComplexityBadgeProps {
  complexity: 'simple' | 'medium' | 'high';
}

export const ComplexityBadge = ({ complexity }: ComplexityBadgeProps) => {
  const config = {
    simple: {
      label: 'Einfach',
      className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50'
    },
    medium: {
      label: 'Mittel',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50'
    },
    high: {
      label: 'Hoch',
      className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
    }
  };

  const { label, className } = config[complexity];

  return (
    <Badge variant="outline" className={cn('text-xs font-medium', className)}>
      {label}
    </Badge>
  );
};
