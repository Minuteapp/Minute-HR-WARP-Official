import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Project {
  id: string;
  status: string;
}

interface ProjectStatusPieChartProps {
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  completed: '#3b82f6',
  'at-risk': '#f97316',
  delayed: '#ef4444',
  'on-hold': '#6b7280',
  planning: '#8b5cf6',
  pending: '#eab308',
  archived: '#9ca3af'
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  'at-risk': 'Gefährdet',
  delayed: 'Verspätet',
  'on-hold': 'Pausiert',
  planning: 'Planung',
  pending: 'Ausstehend',
  archived: 'Archiviert'
};

export const ProjectStatusPieChart = ({ projects }: ProjectStatusPieChartProps) => {
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    status: status,
    percent: Math.round((count / projects.length) * 100)
  }));

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status-Verteilung</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Keine Projektdaten verfügbar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status-Verteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status] || '#6b7280'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [`${value} Projekte`, name]}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
