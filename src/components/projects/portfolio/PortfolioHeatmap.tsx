import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Project {
  id: string;
  name: string;
  status: string;
  priority?: string;
  delay_probability?: number;
  risk_assessment?: { level?: string };
}

interface PortfolioHeatmapProps {
  projects: Project[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#22c55e';
    case 'completed': return '#3b82f6';
    case 'at-risk': return '#f97316';
    case 'delayed': return '#ef4444';
    case 'on-hold': return '#6b7280';
    case 'planning': return '#8b5cf6';
    default: return '#6b7280';
  }
};

const getPriorityScore = (priority?: string) => {
  switch (priority) {
    case 'high': return 8;
    case 'medium': return 5;
    case 'low': return 2;
    default: return 5;
  }
};

export const PortfolioHeatmap = ({ projects }: PortfolioHeatmapProps) => {
  const heatmapData = projects.map(p => ({
    x: Math.round((p.delay_probability || Math.random() * 0.5) * 10),
    y: getPriorityScore(p.priority),
    name: p.name,
    status: p.status,
    color: getStatusColor(p.status)
  }));

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portfolio-Heatmap (Risiko × Impact)</CardTitle>
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
        <CardTitle className="text-base">Portfolio-Heatmap (Risiko × Impact)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Risiko" 
              domain={[0, 10]}
              label={{ value: 'Risiko-Level', position: 'bottom', offset: 0 }}
              className="text-xs"
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Impact" 
              domain={[0, 10]}
              label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-lg">
                      <p className="font-medium text-sm">{data.name}</p>
                      <p className="text-xs text-muted-foreground">Status: {data.status}</p>
                      <p className="text-xs text-muted-foreground">Risiko: {data.x}/10</p>
                      <p className="text-xs text-muted-foreground">Impact: {data.y}/10</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={heatmapData} fill="#8884d8">
              {heatmapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
