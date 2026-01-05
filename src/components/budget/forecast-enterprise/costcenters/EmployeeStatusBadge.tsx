import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EmployeeStatusBadgeProps {
  status: 'active' | 'inactive' | 'onboarding';
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  const config = {
    active: {
      label: 'Aktiv',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    inactive: {
      label: 'Inaktiv',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    },
    onboarding: {
      label: 'Onboarding',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  };

  const { label, className } = config[status] || config.active;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
