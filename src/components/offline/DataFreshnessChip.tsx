import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataFreshnessChipProps {
  lastUpdated: Date | string | number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export const DataFreshnessChip: React.FC<DataFreshnessChipProps> = ({
  lastUpdated,
  className,
  variant = 'secondary'
}) => {
  const getTimeDifference = () => {
    const now = new Date();
    const updatedTime = new Date(lastUpdated);
    const diffMs = now.getTime() - updatedTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return { text: 'Gerade aktualisiert', level: 'fresh' };
    if (diffMinutes < 60) return { text: `vor ${diffMinutes}m`, level: 'fresh' };
    if (diffHours < 24) return { text: `vor ${diffHours}h`, level: diffHours < 2 ? 'fresh' : 'stale' };
    if (diffDays < 7) return { text: `vor ${diffDays}d`, level: 'stale' };
    
    return { text: `vor ${diffDays}d`, level: 'very-stale' };
  };

  const { text, level } = getTimeDifference();

  const getIcon = () => {
    switch (level) {
      case 'fresh':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'stale':
        return <Clock className="h-3 w-3" />;
      case 'very-stale':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getBadgeVariant = () => {
    if (level === 'very-stale') return 'destructive';
    if (level === 'stale') return 'secondary';
    return variant;
  };

  const getTextColor = () => {
    switch (level) {
      case 'fresh':
        return 'text-success';
      case 'stale':
        return 'text-muted-foreground';
      case 'very-stale':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Badge 
      variant={getBadgeVariant()} 
      className={cn(
        "text-xs flex items-center gap-1",
        getTextColor(),
        className
      )}
    >
      {getIcon()}
      {text}
    </Badge>
  );
};