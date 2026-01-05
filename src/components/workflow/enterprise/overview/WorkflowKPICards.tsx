import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const WorkflowKPICards = () => {
  const { data: kpiData } = useQuery({
    queryKey: ['workflow-kpis'],
    queryFn: async () => {
      // Get active workflows count
      const { count: activeWorkflows } = await supabase
        .from('workflow_definitions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get all workflows for success rate calculation
      const { data: workflows } = await supabase
        .from('workflow_definitions')
        .select('success_rate, avg_duration_minutes, execution_count')
        .eq('status', 'active');

      // Get executions for time savings calculation
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('duration_minutes, status')
        .eq('status', 'success');

      // Calculate averages
      const avgSuccessRate = workflows?.length 
        ? workflows.reduce((acc, w) => acc + (Number(w.success_rate) || 0), 0) / workflows.length 
        : 0;
      
      const avgDuration = workflows?.length
        ? workflows.reduce((acc, w) => acc + (Number(w.avg_duration_minutes) || 0), 0) / workflows.length
        : 0;

      // Estimate time savings (assuming 15 min manual vs automated duration)
      const totalExecutions = executions?.length || 0;
      const timeSavingsHours = (totalExecutions * 15 - (executions?.reduce((acc, e) => acc + (Number(e.duration_minutes) || 0), 0) || 0)) / 60;

      return {
        activeWorkflows: activeWorkflows || 0,
        successRate: avgSuccessRate.toFixed(1),
        avgDuration: avgDuration.toFixed(1),
        timeSavingsHours: Math.max(0, timeSavingsHours).toFixed(0),
      };
    },
  });

  const kpis = [
    {
      title: 'Aktive Workflows',
      value: kpiData?.activeWorkflows || 0,
      trend: '+12%',
      trendLabel: 'vs. letzter Monat',
      trendPositive: true,
      icon: Zap,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Erfolgsquote',
      value: `${kpiData?.successRate || 0}%`,
      trend: '+2.1%',
      trendLabel: 'vs. letzter Monat',
      trendPositive: true,
      icon: CheckCircle,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Ø Bearbeitungszeit',
      value: `${kpiData?.avgDuration || 0} Min`,
      trend: '-15%',
      trendLabel: 'vs. letzter Monat',
      trendPositive: true,
      icon: Clock,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Zeitersparnis/Monat',
      value: `${kpiData?.timeSavingsHours || 0} Std`,
      trend: '+28%',
      trendLabel: 'vs. letzter Monat',
      trendPositive: true,
      icon: TrendingUp,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-medium ${kpi.trendPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
