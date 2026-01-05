import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Users, 
  Target, 
  XCircle 
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue';
}

const colorClasses = {
  green: {
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-600',
  },
  yellow: {
    icon: 'bg-yellow-100 text-yellow-600',
    value: 'text-yellow-600',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600',
    value: 'text-orange-600',
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-600',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-600',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-600',
  },
};

const EnterpriseKPICard = ({ label, value, subtitle, icon: Icon, color }: KPICardProps) => {
  const colors = colorClasses[color];
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EnterpriseKPIGrid = () => {
  // Empty state - no mock data
  const kpis: KPICardProps[] = [
    {
      label: 'Aktive Projekte',
      value: '-',
      subtitle: 'Keine Daten verfügbar',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Projekte im Risiko',
      value: '-',
      subtitle: 'Kritische Aufmerksamkeit nötig',
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      label: 'Projekte verspätet',
      value: '-',
      subtitle: 'Keine überfälligen Projekte',
      icon: Clock,
      color: 'orange',
    },
    {
      label: 'Budgetabweichung',
      value: '-',
      subtitle: 'Keine Daten verfügbar',
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Ø Fortschritt',
      value: '-',
      subtitle: 'Portfolio-Durchschnitt',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Auslastung kritische Teams',
      value: '-',
      subtitle: 'Keine Daten verfügbar',
      icon: Users,
      color: 'red',
    },
    {
      label: 'Roadmap-Impact',
      value: '-',
      subtitle: 'Verknüpfte Roadmap-Items',
      icon: Target,
      color: 'green',
    },
    {
      label: 'Blockierte Aufgaben',
      value: '-',
      subtitle: 'Keine blockierten Aufgaben',
      icon: XCircle,
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <EnterpriseKPICard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default EnterpriseKPIGrid;
