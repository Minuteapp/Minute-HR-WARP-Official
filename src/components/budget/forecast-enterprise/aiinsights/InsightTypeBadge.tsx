import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface InsightTypeBadgeProps {
  type: 'warning' | 'opportunity' | 'info';
}

export const InsightTypeBadge: React.FC<InsightTypeBadgeProps> = ({ type }) => {
  const getConfig = () => {
    switch (type) {
      case 'warning':
        return {
          label: 'Warnung',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'opportunity':
        return {
          label: 'Chance',
          icon: TrendingUp,
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'info':
        return {
          label: 'Info',
          icon: Info,
          className: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      default:
        return {
          label: type,
          icon: Info,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
