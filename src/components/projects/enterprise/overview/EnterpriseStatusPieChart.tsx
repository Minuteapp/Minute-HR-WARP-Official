import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const EnterpriseStatusPieChart = () => {
  // Empty state - no mock data
  const data: { name: string; value: number; color: string }[] = [];

  const statusColors: Record<string, string> = {
    active: 'hsl(142, 76%, 36%)',
    completed: 'hsl(217, 91%, 60%)',
    'on-hold': 'hsl(220, 9%, 46%)',
    planning: 'hsl(220, 9%, 70%)',
    delayed: 'hsl(0, 84%, 60%)',
    'at-risk': 'hsl(45, 93%, 47%)',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Projektstatus-Verteilung</CardTitle>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-200 text-gray-600">
            Vorschau
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Übersicht über alle Projektstatus
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Keine Projektdaten für die Verteilung verfügbar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseStatusPieChart;
