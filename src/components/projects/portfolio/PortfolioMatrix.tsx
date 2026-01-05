import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';

interface PortfolioMatrixProps {
  projects: any[];
}

export const PortfolioMatrix = ({ projects }: PortfolioMatrixProps) => {
  // Gruppiere Projekte nach Status
  const activeProjects = projects
    .filter(p => p.status === 'active')
    .map(p => ({
      name: p.name,
      impact: p.impact || 0,
      effort: p.effort || 0,
      budget: (p.budget || 100) / 1000
    }));

  const planningProjects = projects
    .filter(p => p.status === 'planning')
    .map(p => ({
      name: p.name,
      impact: p.impact || 0,
      effort: p.effort || 0,
      budget: (p.budget || 100) / 1000
    }));

  const reviewProjects = projects
    .filter(p => p.status === 'review')
    .map(p => ({
      name: p.name,
      impact: p.impact || 0,
      effort: p.effort || 0,
      budget: (p.budget || 100) / 1000
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">Impact: {payload[0].payload.impact}%</p>
          <p className="text-sm text-muted-foreground">Aufwand: {payload[0].payload.effort}%</p>
          <p className="text-sm text-muted-foreground">Budget: €{payload[0].payload.budget}K</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Matrix: Impact vs. Aufwand vs. Risiko</CardTitle>
        <p className="text-sm text-muted-foreground">
          Größe = Projektbudget | Farbe = Status
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="impact"
              name="Impact"
              unit="%"
              domain={[0, 100]}
              label={{ value: 'Impact', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="effort"
              name="Aufwand"
              unit="%"
              domain={[0, 100]}
              label={{ value: 'Aufwand', angle: -90, position: 'insideLeft' }}
            />
            <ZAxis type="number" dataKey="budget" range={[50, 500]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Scatter
              name="Aktiv"
              data={activeProjects}
              fill="#06b6d4"
            />
            <Scatter
              name="Planung"
              data={planningProjects}
              fill="#3b82f6"
            />
            <Scatter
              name="Review"
              data={reviewProjects}
              fill="#f59e0b"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
