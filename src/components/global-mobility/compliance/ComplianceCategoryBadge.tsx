
import { Badge } from '@/components/ui/badge';

interface ComplianceCategoryBadgeProps {
  category: string;
}

export function ComplianceCategoryBadge({ category }: ComplianceCategoryBadgeProps) {
  const getVariant = () => {
    switch (category.toLowerCase()) {
      case 'visum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'arbeitserlaubnis':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'steuern':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'sozialversicherung':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'aufenthaltstitel':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge variant="outline" className={`${getVariant()} border-0`}>
      {category}
    </Badge>
  );
}
