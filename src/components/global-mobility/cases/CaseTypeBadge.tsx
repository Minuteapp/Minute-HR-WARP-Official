
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface CaseTypeBadgeProps {
  type: string;
}

export const CaseTypeBadge = ({ type }: CaseTypeBadgeProps) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'relocation':
        return { label: 'Relocation', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' };
      case 'assignment':
        return { label: 'Langfristig', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
      case 'transfer':
        return { label: 'Kurzfristig', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 'visa_support':
        return { label: 'Projekt', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
      case 'remote_work':
        return { label: 'Expat', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' };
      default:
        return { label: type, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
};
