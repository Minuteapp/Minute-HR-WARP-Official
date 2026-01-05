import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Lock, FileEdit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
      case 'freigegeben':
        return { 
          label: 'Freigegeben', 
          icon: CheckCircle,
          className: 'bg-green-500/10 text-green-600 border-green-500/20' 
        };
      case 'draft':
      case 'entwurf':
        return { 
          label: 'Entwurf', 
          icon: FileEdit,
          className: 'bg-muted text-muted-foreground border-border' 
        };
      case 'pending':
      case 'ausstehend':
        return { 
          label: 'Ausstehend', 
          icon: Clock,
          className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
        };
      case 'locked':
      case 'gesperrt':
        return { 
          label: 'Gesperrt', 
          icon: Lock,
          className: 'bg-red-500/10 text-red-600 border-red-500/20' 
        };
      default:
        return { 
          label: status, 
          icon: FileEdit,
          className: 'bg-muted text-muted-foreground' 
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('font-normal gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
