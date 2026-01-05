import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RiskLevelBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ level }) => {
  const getConfig = () => {
    switch (level) {
      case 'critical':
        return {
          label: 'Kritisch',
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'high':
        return {
          label: 'Warnung',
          className: 'bg-orange-100 text-orange-700 border-orange-200'
        };
      case 'medium':
        return {
          label: 'Moderat',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      case 'low':
        return {
          label: 'Gut',
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      default:
        return {
          label: level,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
