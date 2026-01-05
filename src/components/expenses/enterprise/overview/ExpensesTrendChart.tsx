
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
  month: string;
  expenses: number;
  employees: number;
}

interface ExpensesTrendChartProps {
  data?: TrendData[];
}

const ExpensesTrendChart = ({ data = [] }: ExpensesTrendChartProps) => {
  const formatExpenses = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  const formatEmployees = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Ausgabentrend & Mitarbeiterwachstum</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={formatExpenses}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={formatEmployees}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'expenses' ? formatExpenses(value) : formatEmployees(value),
                    name === 'expenses' ? 'Ausgaben' : 'Mitarbeiter'
                  ]}
                />
                <Legend 
                  formatter={(value) => value === 'expenses' ? 'Ausgaben' : 'Mitarbeiter'}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="employees" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={{ fill: '#60A5FA', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Keine Trenddaten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesTrendChart;
