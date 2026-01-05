import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp } from 'lucide-react';

export const QuarterlyTrendChart = () => {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['esg-emissions-quarterly'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*')
        .order('created_at', { ascending: true });

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Quartal
      const quarterlyData = new Map<string, number>();
      
      emissions.forEach((e: any) => {
        const date = new Date(e.created_at);
        const year = e.year || date.getFullYear();
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        const key = `Q${quarter} ${year}`;
        
        const current = quarterlyData.get(key) || 0;
        quarterlyData.set(key, current + (Number(e.amount) || 0));
      });

      // Lade Zielwerte
      const { data: targets } = await supabase
        .from('esg_targets')
        .select('*');

      const targetMap = new Map<number, number>();
      targets?.forEach((t: any) => {
        targetMap.set(t.year, Number(t.target_value) || 0);
      });

      return Array.from(quarterlyData.entries())
        .map(([quarter, actual]) => {
          const year = parseInt(quarter.split(' ')[1]);
          const yearTarget = targetMap.get(year) || 0;
          const quarterlyTarget = yearTarget > 0 ? Math.round(yearTarget / 4) : 0;
          
          return {
            quarter,
            actual: Math.round(actual * 10) / 10,
            target: quarterlyTarget > 0 ? quarterlyTarget : undefined,
          };
        })
        .sort((a, b) => {
          const [qA, yA] = a.quarter.split(' ');
          const [qB, yB] = b.quarter.split(' ');
          if (yA !== yB) return parseInt(yA) - parseInt(yB);
          return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
        });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quartalsweise Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quartalsweise Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Quartalsdaten vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Emissionsdaten, um Quartalsvergleiche zu sehen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasTargets = chartData.some(d => d.target !== undefined);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quartalsweise Entwicklung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    actual: 'Ist-Werte',
                    target: 'Ziel'
                  };
                  return [`${value} t CO₂e`, labels[name] || name];
                }}
              />
              <Legend 
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    actual: 'Ist-Werte',
                    target: 'Ziel'
                  };
                  return labels[value] || value;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                name="actual"
              />
              {hasTargets && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#9ca3af', strokeWidth: 2 }}
                  name="target"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
