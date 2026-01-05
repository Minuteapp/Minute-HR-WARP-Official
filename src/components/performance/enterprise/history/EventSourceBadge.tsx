import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EventSourceBadgeProps {
  source: string | null;
}

export const EventSourceBadge: React.FC<EventSourceBadgeProps> = ({ source }) => {
  if (!source) return null;

  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      Quelle: {source}
    </Badge>
  );
};
