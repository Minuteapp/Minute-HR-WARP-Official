import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BudgetDevelopmentChartProps {
  fiscalYear: string;
}

export const BudgetDevelopmentChart: React.FC<BudgetDevelopmentChartProps> = ({ fiscalYear }) => {
  const { data: chartData = [] } = useQuery({
    queryKey: ['budget-development-chart', fiscalYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('entry_date, amount, type')
        .gte('entry_date', `${fiscalYear}-01-01`)
        .lte('entry_date', `${fiscalYear}-12-31`)
        .order('entry_date');

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: { plan: number; actual: number; forecast: number } } = {};
      const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
      
      months.forEach((month) => {
        monthlyData[month] = { plan: 0, actual: 0, forecast: 0 };
      });

      (data || []).forEach((transaction) => {
        const date = new Date(transaction.entry_date);
        const monthIndex = date.getMonth();
        const month = months[monthIndex];
        monthlyData[month].actual += Number(transaction.amount) || 0;
      });

      return months.map((month) => ({
        month,
        plan: monthlyData[month].plan,
        actual: monthlyData[month].actual,
        forecast: monthlyData[month].forecast,
      }));
    },
  });

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  const hasData = chartData.some(d => d.plan > 0 || d.actual > 0 || d.forecast > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Budgetentwicklung {fiscalYear} – Plan vs. Ist vs. Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[300px]">
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
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  name="Plan"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  name="Ist"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="hsl(var(--warning))" 
                  name="Forecast"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Daten für das ausgewählte Geschäftsjahr vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
