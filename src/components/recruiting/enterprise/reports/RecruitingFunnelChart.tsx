import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
}

interface RecruitingFunnelChartProps {
  stages: FunnelStage[];
}

const RecruitingFunnelChart = ({ stages }: RecruitingFunnelChartProps) => {
  const colors = [
    'bg-primary',
    'bg-primary/80',
    'bg-primary/60',
    'bg-primary/40',
    'bg-green-500'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Recruiting Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {stages.length > 0 ? (
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{stage.name}</span>
                  <span className="text-muted-foreground">
                    {stage.count} ({stage.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-lg overflow-hidden">
                  <div 
                    className={`h-full ${colors[index] || 'bg-primary'} rounded-lg transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Keine Daten verfügbar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecruitingFunnelChart;
