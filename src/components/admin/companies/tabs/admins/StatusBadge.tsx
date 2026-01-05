
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          Aktiv
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Ausstehend
        </Badge>
      );
    case 'created':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Einladung erforderlich
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};
