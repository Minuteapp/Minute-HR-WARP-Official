import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const TopCostBlocksChart = () => {
  const { data: chartData = [] } = useQuery({
    queryKey: ['top-cost-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('category, amount');

      if (error) throw error;

      // Group by category
      const categoryTotals: { [key: string]: number } = {};
      (data || []).forEach((transaction) => {
        const category = transaction.category || 'Sonstige';
        categoryTotals[category] = (categoryTotals[category] || 0) + (Number(transaction.amount) || 0);
      });

      // Convert to array and sort
      const sortedCategories = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return sortedCategories;
    },
  });

  const formatValue = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  const hasData = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top-5 Kostenblöcke</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={formatValue} className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={70} />
                <Tooltip 
                  formatter={(value: number) => formatValue(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Keine Transaktionsdaten vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
