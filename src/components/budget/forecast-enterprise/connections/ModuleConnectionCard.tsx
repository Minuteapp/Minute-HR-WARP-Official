import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, DollarSign, Building, TrendingUp, Leaf, LucideIcon } from 'lucide-react';
import { ModuleStatusBadge } from './ModuleStatusBadge';

interface ModuleConnectionCardProps {
  moduleName: string;
  moduleType: string;
  description: string;
  status: 'active' | 'pending' | 'inactive';
  linkedAmount: number;
  lastSync?: string;
}

const moduleIcons: Record<string, { icon: LucideIcon; bgColor: string; iconColor: string }> = {
  payroll: { icon: Users, bgColor: 'bg-primary/10', iconColor: 'text-primary' },
  time_tracking: { icon: Clock, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  expenses: { icon: DollarSign, bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  projects: { icon: Building, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  workforce: { icon: TrendingUp, bgColor: 'bg-pink-100', iconColor: 'text-pink-600' },
  esg: { icon: Leaf, bgColor: 'bg-green-100', iconColor: 'text-green-600' }
};

export const ModuleConnectionCard: React.FC<ModuleConnectionCardProps> = ({
  moduleName,
  moduleType,
  description,
  status,
  linkedAmount,
  lastSync
}) => {
  const iconConfig = moduleIcons[moduleType] || moduleIcons.payroll;
  const Icon = iconConfig.icon;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€ ${(value / 1000000).toFixed(2)} Mio`;
    }
    return `€ ${value.toLocaleString('de-DE')}`;
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Nie synchronisiert';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffMins < 1440) return `vor ${Math.floor(diffMins / 60)} Std.`;
    return date.toLocaleDateString('de-DE');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 rounded-lg ${iconConfig.bgColor} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconConfig.iconColor}`} />
          </div>
          <ModuleStatusBadge status={status} />
        </div>
        
        <h3 className="font-semibold text-foreground">{moduleName}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">{formatCurrency(linkedAmount)}</p>
            <p className="text-xs text-muted-foreground">Verknüpft</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatLastSync(lastSync)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
