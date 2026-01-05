import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Target, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const HistoryKPICards = () => {
  const { data: events } = useQuery({
    queryKey: ['performance-history-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_history')
        .select('event_type');
      if (error) throw error;
      return data || [];
    }
  });

  const reviews = events?.filter(e => e.event_type === 'review_completed').length || 0;
  const goals = events?.filter(e => e.event_type === 'goal_reached').length || 0;
  const actions = events?.filter(e => e.event_type === 'action_completed').length || 0;

  const kpis = [
    {
      icon: MessageSquare,
      value: reviews,
      label: 'Abgeschlossene Reviews',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Target,
      value: goals,
      label: 'Erreichte Ziele',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      icon: Users,
      value: actions,
      label: 'Abgeschl. Maßnahmen',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
