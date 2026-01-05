import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyDevelopmentChartProps {
  budgetId: string;
}

export const MonthlyDevelopmentChart: React.FC<MonthlyDevelopmentChartProps> = ({ budgetId }) => {
  const { data: chartData = [] } = useQuery({
    queryKey: ['budget-monthly-development', budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('entry_date, amount')
        .eq('budget_id', budgetId)
        .order('entry_date');

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
      
      months.forEach((month) => {
        monthlyData[month] = 0;
      });

      (data || []).forEach((transaction) => {
        const date = new Date(transaction.entry_date);
        const monthIndex = date.getMonth();
        if (monthIndex < 6) {
          const month = months[monthIndex];
          monthlyData[month] += Number(transaction.amount) || 0;
        }
      });

      // Create cumulative data
      let cumulative = 0;
      return months.map((month) => {
        cumulative += monthlyData[month];
        return {
          month,
          plan: 0, // Would be calculated from budget plan
          actual: cumulative,
        };
      });
    },
    enabled: !!budgetId,
  });

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  const hasData = chartData.some(d => d.plan > 0 || d.actual > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Monatliche Entwicklung</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={formatYAxis} className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => formatYAxis(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="plan" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  name="Plan"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  name="Ist"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Keine Transaktionsdaten vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
