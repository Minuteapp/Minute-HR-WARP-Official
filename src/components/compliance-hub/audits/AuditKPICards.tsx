import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, AlertTriangle, FileText, Shield } from 'lucide-react';

export interface AuditKPIData {
  totalAudits: { value: number; completed: number };
  openMeasures: { value: number };
  documentCategories: { value: number; allAvailable: boolean };
  auditReadiness: { percent: number; rating: string };
}

interface AuditKPICardsProps {
  data?: AuditKPIData;
}

export const AuditKPICards: React.FC<AuditKPICardsProps> = ({ data }) => {
  const kpis = [
    {
      icon: ClipboardCheck,
      iconBg: 'bg-blue-100 dark:bg-blue-950/30',
      iconColor: 'text-blue-600',
      title: 'Audits gesamt',
      value: data?.totalAudits?.value !== undefined ? data.totalAudits.value.toString() : '--',
      subtitle: data?.totalAudits?.completed !== undefined ? `${data.totalAudits.completed} abgeschlossen` : 'Keine Daten',
    },
    {
      icon: AlertTriangle,
      iconBg: 'bg-orange-100 dark:bg-orange-950/30',
      iconColor: 'text-orange-600',
      title: 'Offene Maßnahmen',
      value: data?.openMeasures?.value !== undefined ? data.openMeasures.value.toString() : '--',
      subtitle: 'benötigen Aktion',
    },
    {
      icon: FileText,
      iconBg: 'bg-green-100 dark:bg-green-950/30',
      iconColor: 'text-green-600',
      title: 'Nachweiskategorien',
      value: data?.documentCategories?.value !== undefined ? data.documentCategories.value.toString() : '--',
      subtitle: data?.documentCategories?.allAvailable ? (
        <span className="text-green-600">Alle verfügbar</span>
      ) : 'Nicht vollständig',
    },
    {
      icon: Shield,
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600',
      title: 'Audit-Bereitschaft',
      value: data?.auditReadiness?.percent !== undefined ? `${data.auditReadiness.percent}%` : '--%',
      subtitle: data?.auditReadiness?.rating || 'Keine Daten',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <div className="text-sm text-muted-foreground">{kpi.subtitle}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
