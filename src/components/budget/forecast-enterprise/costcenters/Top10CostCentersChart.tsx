import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Top10CostCentersChart = () => {
  const { data: costCenters } = useQuery({
    queryKey: ['top10-cost-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('name, planned_amount, actual_amount')
        .order('planned_amount', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  const chartData = costCenters?.map(cc => ({
    name: cc.name?.length > 15 ? cc.name.substring(0, 15) + '...' : cc.name,
    Budget: cc.planned_amount || 0,
    Ist: cc.actual_amount || 0
  })) || [];

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top 10 Kostenstellen nach Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
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
                  formatter={(value: number) => formatYAxis(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ist" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
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
