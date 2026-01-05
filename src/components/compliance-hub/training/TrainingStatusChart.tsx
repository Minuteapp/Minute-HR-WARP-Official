import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TrainingStatusData {
  completed: number;
  overdue: number;
  pending: number;
}

interface TrainingStatusChartProps {
  data?: TrainingStatusData;
}

export const TrainingStatusChart: React.FC<TrainingStatusChartProps> = ({ data }) => {
  const chartData = data ? [
    { name: 'Abgeschlossen', value: data.completed, color: '#22c55e' },
    { name: 'Überfällig', value: data.overdue, color: '#ef4444' },
    { name: 'Anstehend', value: data.pending, color: '#f97316' },
  ] : [];

  const hasData = chartData.some(item => item.value > 0);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Schulungsstatus Übersicht</CardTitle>
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
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Keine Daten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
