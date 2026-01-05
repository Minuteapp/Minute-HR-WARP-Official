import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface ArchiveStatusBadgeProps {
  status: 'completed' | 'cancelled';
}

export const ArchiveStatusBadge: React.FC<ArchiveStatusBadgeProps> = ({ status }) => {
  const config = status === 'completed' 
    ? {
        label: 'Abgeschlossen',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 border-green-200'
      }
    : {
        label: 'Abgebrochen',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200'
      };

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
