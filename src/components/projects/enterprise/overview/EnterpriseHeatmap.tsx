import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

const EnterpriseHeatmap = () => {
  // Empty state - no mock data
  const data: { projectName: string; riskLevel: number; impactScore: number; color: string }[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio-Heatmap (Risiko × Impact)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Positionierung aller Projekte nach Risiko und Geschäftsauswirkung
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Keine Projektdaten für die Heatmap verfügbar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="riskLevel" 
                name="Risiko-Level" 
                domain={[0, 10]}
                label={{ value: 'Risiko-Level', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="impactScore" 
                name="Impact Score" 
                domain={[0, 10]}
                label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis range={[100, 500]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Projekte" data={data} fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseHeatmap;
