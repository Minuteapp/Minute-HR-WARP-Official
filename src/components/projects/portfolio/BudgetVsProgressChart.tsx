import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Project {
  id: string;
  name: string;
  progress?: number;
  budget?: number;
  budget_spent?: number;
}

interface BudgetVsProgressChartProps {
  projects: Project[];
}

export const BudgetVsProgressChart = ({ projects }: BudgetVsProgressChartProps) => {
  const chartData = projects
    .filter(p => p.budget && p.budget > 0)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      budgetPercent: p.budget && p.budget_spent 
        ? Math.round((p.budget_spent / p.budget) * 100) 
        : 0,
      progress: p.progress || 0
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget vs. Fortschritt</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Keine Budgetdaten verfügbar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget vs. Fortschritt</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60}
              className="text-xs"
              interval={0}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value}%`, 
                name === 'budgetPercent' ? 'Budget verbraucht' : 'Fortschritt'
              ]}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              verticalAlign="top"
              formatter={(value) => value === 'budgetPercent' ? 'Budget verbraucht' : 'Fortschritt'}
            />
            <Bar dataKey="budgetPercent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="progress" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
