import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BenchmarkData } from '@/hooks/usePulseTrends';

interface BenchmarkComparisonChartProps {
  data: BenchmarkData[];
}

export const BenchmarkComparisonChart = ({ data }: BenchmarkComparisonChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{payload[0].payload.category}</p>
          <p className="text-gray-600 text-sm">Branchendurchschnitt: {payload[0].value.toFixed(1)}</p>
          <p className="text-green-600 text-sm">Top Performer: {payload[1].value.toFixed(1)}</p>
          <p className="text-blue-600 text-sm">Unser Unternehmen: {payload[2].value.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmark-Vergleich (Branchen-Daten 2025)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart layout="horizontal" data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 4]} />
            <YAxis type="category" dataKey="category" width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="branchendurchschnitt" fill="#9CA3AF" name="Branchendurchschnitt" />
            <Bar dataKey="topPerformer" fill="#10B981" name="Top Performer" />
            <Bar dataKey="unserUnternehmen" fill="#6366F1" name="Unser Unternehmen" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
