import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LongTermDataPoint } from '@/hooks/usePulseTrends';

interface LongTermTrendChartProps {
  data: LongTermDataPoint[];
  isAreaChart: boolean;
  onToggleChartType: (isArea: boolean) => void;
}

export const LongTermTrendChart = ({ data, isAreaChart, onToggleChartType }: LongTermTrendChartProps) => {
  const Chart = isAreaChart ? AreaChart : LineChart;
  const DataComponent = isAreaChart ? Area : Line;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Langzeit-Trend (8 Quartale)</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={!isAreaChart ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleChartType(false)}
            >
              Linienchart
            </Button>
            <Button
              variant={isAreaChart ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleChartType(true)}
            >
              Flächenchart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey="engagement"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={isAreaChart ? 0.6 : 1}
              strokeWidth={2}
              dot={!isAreaChart}
              name="Engagement"
            />
            <DataComponent
              type="monotone"
              dataKey="stressIndex"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={isAreaChart ? 0.6 : 1}
              strokeWidth={2}
              dot={!isAreaChart}
              name="Stress-Index"
            />
            <DataComponent
              type="monotone"
              dataKey="satisfaction"
              stroke="#14B8A6"
              fill="#14B8A6"
              fillOpacity={isAreaChart ? 0.6 : 1}
              strokeWidth={2}
              dot={!isAreaChart}
              name="Zufriedenheit"
            />
          </Chart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
