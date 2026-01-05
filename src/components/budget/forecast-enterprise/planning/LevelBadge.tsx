import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level }) => {
  const getLevelConfig = () => {
    switch (level) {
      case 'company':
      case 'unternehmen':
        return { label: 'Unternehmen', className: 'bg-primary/10 text-primary border-primary/20' };
      case 'subsidiary':
      case 'gesellschaft':
        return { label: 'Gesellschaft', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'location':
      case 'standort':
        return { label: 'Standort', className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
      case 'department':
      case 'abteilung':
        return { label: 'Abteilung', className: 'bg-green-500/10 text-green-600 border-green-500/20' };
      case 'team':
        return { label: 'Team', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
      case 'project':
      case 'projekt':
        return { label: 'Projekt', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
      case 'cost_center':
      case 'kostenstelle':
        return { label: 'Kostenstelle', className: 'bg-pink-500/10 text-pink-600 border-pink-500/20' };
      default:
        return { label: level, className: 'bg-muted text-muted-foreground' };
    }
  };

  const config = getLevelConfig();

  return (
    <Badge variant="outline" className={cn('font-normal', config.className)}>
      {config.label}
    </Badge>
  );
};
