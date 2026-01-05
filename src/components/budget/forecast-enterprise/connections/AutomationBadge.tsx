import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';

interface AutomationBadgeProps {
  type: 'automatic' | 'manual' | 'after_approval';
}

export const AutomationBadge: React.FC<AutomationBadgeProps> = ({ type }) => {
  const getConfig = () => {
    switch (type) {
      case 'automatic':
        return {
          label: 'Vollautomatisch',
          icon: Zap,
          className: 'bg-primary/10 text-primary border-primary/20'
        };
      case 'after_approval':
        return {
          label: 'Nach Freigabe',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      case 'manual':
        return {
          label: 'Manuell',
          icon: Clock,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          label: type,
          icon: Clock,
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
