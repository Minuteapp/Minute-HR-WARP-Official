import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DepartmentTrend } from '@/hooks/usePulseTrends';

interface DepartmentTrendsChartProps {
  trends: DepartmentTrend[];
  showByDepartment: boolean;
  onToggleView: (byDepartment: boolean) => void;
}

export const DepartmentTrendsChart = ({ trends, showByDepartment, onToggleView }: DepartmentTrendsChartProps) => {
  // Transform data for recharts
  const months = ['Jul', 'Aug', 'Sep', 'Okt'];
  const transformedData = months.map(month => {
    const dataPoint: any = { month };
    trends.forEach(trend => {
      const value = trend.data.find(d => d.month === month)?.value || 0;
      dataPoint[`${trend.name} (${trend.count})`] = value;
    });
    return dataPoint;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Entwicklung letzte 4 Monate</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={showByDepartment ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleView(true)}
            >
              Nach Abteilung
            </Button>
            <Button
              variant={!showByDepartment ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleView(false)}
            >
              Nach Standort
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value: string) => {
                const trend = trends.find(t => value.includes(t.name));
                return trend ? `${value}: ${trend.currentValue}` : value;
              }}
            />
            {trends.map(trend => (
              <Line
                key={trend.name}
                type="monotone"
                dataKey={`${trend.name} (${trend.count})`}
                stroke={trend.color}
                strokeWidth={2}
                dot
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
