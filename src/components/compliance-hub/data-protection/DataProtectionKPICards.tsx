import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, User, Trash2, AlertTriangle } from 'lucide-react';

export interface DataProtectionKPIData {
  dataCategories: { value: number };
  openRequests: { value: number; highPriority: number };
  plannedDeletions: { value: number };
  overdueDeletions: { value: number };
}

interface DataProtectionKPICardsProps {
  data?: DataProtectionKPIData;
}

export const DataProtectionKPICards: React.FC<DataProtectionKPICardsProps> = ({ data }) => {
  const kpis = [
    {
      icon: FileText,
      iconBg: 'bg-blue-100 dark:bg-blue-950/30',
      iconColor: 'text-blue-600',
      title: 'Datenkategorien',
      value: data?.dataCategories?.value ?? 0,
      subtitle: 'aktiv verwaltet',
    },
    {
      icon: User,
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600',
      title: 'Offene DS-Anfragen',
      value: data?.openRequests?.value ?? 0,
      subtitle: data?.openRequests?.highPriority ? `${data.openRequests.highPriority} hoch` : null,
      subtitleColor: 'text-red-500',
    },
    {
      icon: Trash2,
      iconBg: 'bg-orange-100 dark:bg-orange-950/30',
      iconColor: 'text-orange-600',
      title: 'Löschungen geplant',
      value: data?.plannedDeletions?.value ?? 0,
      subtitle: 'Datensätze',
    },
    {
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-950/30',
      iconColor: 'text-red-600',
      title: 'Überfällige Löschungen',
      value: data?.overdueDeletions?.value ?? 0,
      subtitle: data?.overdueDeletions?.value && data.overdueDeletions.value > 0 ? 'sofort handeln' : null,
      subtitleColor: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                {kpi.subtitle && (
                  <p className={`text-sm mt-1 ${kpi.subtitleColor || 'text-muted-foreground'}`}>
                    {kpi.subtitle}
                  </p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-full ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
