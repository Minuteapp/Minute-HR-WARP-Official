import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeviationsCategoryChartProps {
  deviationType: string;
}

export const DeviationsCategoryChart: React.FC<DeviationsCategoryChartProps> = ({ deviationType }) => {
  const { data: deviations } = useQuery({
    queryKey: ['deviations-chart', deviationType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_deviations')
        .select('category, plan_amount, actual_ytd_amount, forecast_amount, deviation_amount')
        .order('plan_amount', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const chartData = deviations?.map(d => ({
    category: d.category?.length > 12 ? d.category.substring(0, 12) + '...' : d.category,
    Plan: d.plan_amount || 0,
    Ist: d.actual_ytd_amount || 0,
    Forecast: d.forecast_amount || 0,
    Abweichung: d.deviation_amount || 0
  })) || [];

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Abweichungsanalyse nach Kategorie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatYAxis(value), name]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Plan" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ist" fill="hsl(210, 70%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Forecast" fill="hsl(30, 80%, 55%)" radius={[4, 4, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="Abweichung" 
                  stroke="hsl(0, 70%, 50%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(0, 70%, 50%)', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
