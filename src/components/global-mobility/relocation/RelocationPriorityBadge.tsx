
import { Badge } from '@/components/ui/badge';

interface RelocationPriorityBadgeProps {
  priority: string;
}

export function RelocationPriorityBadge({ priority }: RelocationPriorityBadgeProps) {
  const getVariant = () => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'hoch':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
      case 'mittel':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
      case 'niedrig':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLabel = () => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return priority;
    }
  };

  return (
    <Badge variant="outline" className={`${getVariant()} border-0`}>
      {getLabel()}
    </Badge>
  );
}
