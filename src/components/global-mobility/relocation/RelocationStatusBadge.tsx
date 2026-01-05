
import { Badge } from '@/components/ui/badge';

interface RelocationStatusBadgeProps {
  status: string;
}

export function RelocationStatusBadge({ status }: RelocationStatusBadgeProps) {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'abgeschlossen':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in_bearbeitung':
      case 'in bearbeitung':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'offen':
      case 'open':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLabel = () => {
    switch (status.toLowerCase()) {
      case 'abgeschlossen':
      case 'completed':
        return 'Abgeschlossen';
      case 'in_bearbeitung':
      case 'in bearbeitung':
        return 'In Bearbeitung';
      case 'offen':
      case 'open':
        return 'Offen';
      default:
        return status;
    }
  };

  return (
    <Badge variant="outline" className={`${getVariant()} border-0`}>
      {getLabel()}
    </Badge>
  );
}
