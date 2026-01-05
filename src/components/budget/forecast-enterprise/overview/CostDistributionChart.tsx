import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted))'];

export const CostDistributionChart = () => {
  const { data: chartData = [] } = useQuery({
    queryKey: ['cost-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('category, amount');

      if (error) throw error;

      // Group by category
      const categoryTotals: { [key: string]: number } = {};
      let total = 0;
      (data || []).forEach((transaction) => {
        const category = transaction.category || 'Sonstige';
        const amount = Number(transaction.amount) || 0;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        total += amount;
      });

      // Convert to array with percentages
      return Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      }));
    },
  });

  const hasData = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kostenverteilung</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `€${value.toLocaleString('de-DE')}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
              </PieChart>
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
