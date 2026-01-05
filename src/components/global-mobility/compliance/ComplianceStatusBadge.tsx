
import { Badge } from '@/components/ui/badge';

interface ComplianceStatusBadgeProps {
  status: string;
}

export function ComplianceStatusBadge({ status }: ComplianceStatusBadgeProps) {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'abgeschlossen':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in_bearbeitung':
      case 'in bearbeitung':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'offen':
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'kritisch':
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const displayStatus = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Badge variant="outline" className={`${getVariant()} border-0`}>
      {displayStatus}
    </Badge>
  );
}
