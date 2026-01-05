import React from 'react';
import { Badge } from '@/components/ui/badge';

interface YearBadgeProps {
  year: number;
}

export const YearBadge: React.FC<YearBadgeProps> = ({ year }) => {
  return (
    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono">
      {year}
    </Badge>
  );
};
