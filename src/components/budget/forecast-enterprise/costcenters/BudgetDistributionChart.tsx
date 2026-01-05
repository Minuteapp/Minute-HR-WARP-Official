import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(210, 70%, 50%)',
  'hsl(180, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(var(--muted-foreground))',
  'hsl(330, 60%, 55%)',
  'hsl(150, 60%, 45%)',
  'hsl(270, 50%, 55%)',
  'hsl(45, 70%, 50%)',
  'hsl(0, 60%, 55%)'
];

export const BudgetDistributionChart = () => {
  const { data: costCenters } = useQuery({
    queryKey: ['budget-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('department, planned_amount');
      if (error) throw error;
      return data || [];
    }
  });

  // Aggregate by department
  const departmentTotals = costCenters?.reduce((acc, cc) => {
    const dept = cc.department || 'Sonstige';
    acc[dept] = (acc[dept] || 0) + (cc.planned_amount || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  const totalBudget = Object.values(departmentTotals).reduce((sum, val) => sum + val, 0);

  const chartData = Object.entries(departmentTotals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalBudget > 0 ? ((value / totalBudget) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget-Verteilung nach Abteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatValue(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
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
