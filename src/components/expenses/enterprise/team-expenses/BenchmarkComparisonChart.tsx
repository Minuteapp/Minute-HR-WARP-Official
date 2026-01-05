
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export interface BenchmarkData {
  department: string;
  current: number;
  industryBenchmark: number;
  target: number;
}

interface BenchmarkComparisonChartProps {
  data: BenchmarkData[];
}


const BenchmarkComparisonChart = ({ data }: BenchmarkComparisonChartProps) => {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ausgaben pro MA - Benchmark-Vergleich</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine Benchmark-Daten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ausgaben pro MA - Benchmark-Vergleich</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="department" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [`€${value.toLocaleString('de-DE')}`, '']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="current" 
              name="Aktuell" 
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="industryBenchmark" 
              name="Branchenschnitt" 
              fill="#9CA3AF" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="target" 
              name="Ziel" 
              fill="#60A5FA" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BenchmarkComparisonChart;
