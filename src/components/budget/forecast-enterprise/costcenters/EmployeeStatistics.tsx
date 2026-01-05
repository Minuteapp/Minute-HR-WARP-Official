import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const EmployeeStatistics = () => {
  const { data: employees } = useQuery({
    queryKey: ['employee-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, status, employment_type, salary');
      if (error) throw error;
      return data || [];
    }
  });

  const total = employees?.length || 0;
  const active = employees?.filter(e => e.status === 'active').length || 0;
  const fullTime = employees?.filter(e => e.employment_type === 'full-time').length || 0;
  const partTime = employees?.filter(e => e.employment_type === 'part-time').length || 0;
  const totalSalary = employees?.reduce((sum, e) => sum + (e.salary || 0), 0) || 0;
  const avgSalary = total > 0 ? totalSalary / total : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€ ${(value / 1000).toFixed(0)}k`;
    return `€ ${value.toFixed(0)}`;
  };

  const stats = [
    {
      title: 'Gesamt',
      value: total,
      subtitle: 'Mitarbeiter',
      titleColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Aktiv',
      value: active,
      subtitle: total > 0 ? `${((active / total) * 100).toFixed(1)}%` : '0%',
      titleColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Vollzeit',
      value: fullTime,
      subtitle: total > 0 ? `${((fullTime / total) * 100).toFixed(1)}%` : '0%',
      titleColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Teilzeit',
      value: partTime,
      subtitle: total > 0 ? `${((partTime / total) * 100).toFixed(1)}%` : '0%',
      titleColor: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      title: 'Ø Gehalt',
      value: formatCurrency(avgSalary),
      subtitle: 'pro Jahr',
      titleColor: 'text-primary'
    },
    {
      title: 'Gesamtkosten',
      value: formatCurrency(totalSalary),
      subtitle: 'pro Jahr',
      titleColor: 'text-primary'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mitarbeiter-Statistiken ({total} MA Gesamt)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-4">
              <p className={`text-sm font-medium ${stat.titleColor}`}>{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
