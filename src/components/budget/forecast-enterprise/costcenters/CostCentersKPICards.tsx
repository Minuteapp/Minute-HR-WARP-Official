import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Users, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CostCentersKPICards = () => {
  const { data: costCenters } = useQuery({
    queryKey: ['cost-centers-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const totalCostCenters = costCenters?.length || 0;
  const totalEmployees = costCenters?.reduce((sum, cc) => sum + (cc.employee_count || 0), 0) || 0;
  const totalPersonnelCost = costCenters?.reduce((sum, cc) => sum + (cc.total_personnel_cost || 0), 0) || 0;
  const avgSalary = totalEmployees > 0 ? totalPersonnelCost / totalEmployees : 0;
  
  const normalCount = costCenters?.filter(cc => cc.status === 'normal').length || 0;
  const warningCount = costCenters?.filter(cc => cc.status === 'warning').length || 0;
  const criticalCount = costCenters?.filter(cc => cc.status === 'critical').length || 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€ ${(value / 1000).toFixed(0)}k`;
    return `€ ${value.toFixed(0)}`;
  };

  const kpis = [
    {
      title: 'Kostenstellen',
      value: `${totalCostCenters} Aktiv`,
      subtitle: `${totalEmployees} Mitarbeiter`,
      icon: Building,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Personalkosten',
      value: formatCurrency(totalPersonnelCost),
      subtitle: `Ø ${formatCurrency(avgSalary)}/MA`,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Im Plan',
      value: `${normalCount} Kostenstellen`,
      subtitle: totalCostCenters > 0 ? `${((normalCount / totalCostCenters) * 100).toFixed(1)}%` : '0%',
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Warnung',
      value: `${warningCount} Kostenstellen`,
      subtitle: '5-15% Abweichung',
      icon: AlertCircle,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Kritisch',
      value: `${criticalCount} Kostenstellen`,
      subtitle: '>15% Abweichung',
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
