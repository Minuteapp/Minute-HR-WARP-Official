
import { Badge } from '@/components/ui/badge';

interface ContractStatusBadgeProps {
  status: string;
}

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'aktiv - entsendungsvertrag':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'aktiv - lokaler vertrag':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'in vorbereitung':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'beendet':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge variant="outline" className={`${getVariant()} border-0`}>
      {status}
    </Badge>
  );
}
