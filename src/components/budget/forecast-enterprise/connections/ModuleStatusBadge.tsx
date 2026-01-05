import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ModuleStatusBadgeProps {
  status: 'active' | 'pending' | 'inactive';
}

export const ModuleStatusBadge: React.FC<ModuleStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Aktiv',
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'pending':
        return {
          label: 'Ausstehend',
          className: 'bg-orange-100 text-orange-700 border-orange-200'
        };
      case 'inactive':
        return {
          label: 'Inaktiv',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
