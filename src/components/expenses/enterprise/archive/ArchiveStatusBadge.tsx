
import { Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArchiveStatusBadgeProps {
  status: 'archived';
}

const ArchiveStatusBadge = ({ status }: ArchiveStatusBadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
      "bg-muted text-muted-foreground"
    )}>
      <Archive className="h-3 w-3" />
      Archiviert
    </span>
  );
};

export default ArchiveStatusBadge;
