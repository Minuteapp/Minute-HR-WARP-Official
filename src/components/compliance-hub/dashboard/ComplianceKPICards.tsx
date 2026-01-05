// Compliance Hub - 6 KPI-Karten
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, XCircle, GraduationCap, Clock, FileText, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

export interface ComplianceKPIData {
  openRisks: { value: number; critical: number; trend: number };
  violations: { current: number; total: number; trend: number };
  trainingCompletion: { percent: number; trend: number };
  workingTimeViolations: { value: number; critical: number; trend: number };
  dataRequests: { value: number; trend: number };
  expenseViolations: { value: number; trend: number };
}

interface ComplianceKPICardsProps {
  data?: ComplianceKPIData;
  isLoading?: boolean;
}

export const ComplianceKPICards: React.FC<ComplianceKPICardsProps> = ({
  data,
  isLoading = false
}) => {
  const renderTrend = (trend: number, inverted: boolean = false) => {
    const isPositive = inverted ? trend < 0 : trend > 0;
    const isNegative = inverted ? trend > 0 : trend < 0;
    
    return (
      <span className={`flex items-center gap-1 text-xs ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'
      }`}>
        {trend > 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : trend < 0 ? (
          <TrendingDown className="h-3 w-3" />
        ) : null}
        {trend > 0 ? '+' : ''}{trend}% vs. Vormonat
      </span>
    );
  };

  const kpiItems = data ? [
    {
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      title: 'Offene Compliance-Risiken',
      value: data.openRisks.value,
      subtitle: `(${data.openRisks.critical} krit.)`,
      trend: data.openRisks.trend,
      invertTrend: true
    },
    {
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'Verstöße aktuell / Q4',
      value: `${data.violations.current} / ${data.violations.total}`,
      subtitle: `+${data.violations.trend} vs. Vormonat`,
      trend: data.violations.trend,
      invertTrend: true
    },
    {
      icon: GraduationCap,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'Pflichtschulungen: Erfüllung',
      value: `${data.trainingCompletion.percent}%`,
      subtitle: `+${data.trainingCompletion.trend}% vs. Vormonat`,
      trend: data.trainingCompletion.trend,
      invertTrend: false
    },
    {
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Arbeitszeitverstöße',
      value: data.workingTimeViolations.value,
      subtitle: `(${data.workingTimeViolations.critical} krit.)`,
      trend: data.workingTimeViolations.trend,
      invertTrend: true
    },
    {
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Offene DS-Anfragen',
      value: data.dataRequests.value,
      subtitle: `${data.dataRequests.trend > 0 ? '+' : ''}${data.dataRequests.trend} vs. Vormonat`,
      trend: data.dataRequests.trend,
      invertTrend: true
    },
    {
      icon: Receipt,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      title: 'Spesen-Policy-Verstöße',
      value: data.expenseViolations.value,
      subtitle: `${data.expenseViolations.trend > 0 ? '+' : ''}${data.expenseViolations.trend} vs. Vormonat`,
      trend: data.expenseViolations.trend,
      invertTrend: true
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card">
            <CardContent className="pt-4">
              <div className="animate-pulse space-y-3">
                <div className="h-10 w-10 bg-muted rounded-lg"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { icon: AlertTriangle, title: 'Offene Compliance-Risiken', iconColor: 'text-orange-600', iconBg: 'bg-orange-100' },
          { icon: XCircle, title: 'Verstöße aktuell / Q4', iconColor: 'text-red-600', iconBg: 'bg-red-100' },
          { icon: GraduationCap, title: 'Pflichtschulungen: Erfüllung', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
          { icon: Clock, title: 'Arbeitszeitverstöße', iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
          { icon: FileText, title: 'Offene DS-Anfragen', iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
          { icon: Receipt, title: 'Spesen-Policy-Verstöße', iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' }
        ].map((item, index) => (
          <Card key={index} className="bg-card">
            <CardContent className="pt-4">
              <div className={`p-2 ${item.iconBg} rounded-lg w-fit mb-3`}>
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{item.title}</p>
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground mt-1">Keine Daten</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiItems.map((item, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="pt-4">
            <div className={`p-2 ${item.iconBg} rounded-lg w-fit mb-3`}>
              <item.icon className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{item.title}</p>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
