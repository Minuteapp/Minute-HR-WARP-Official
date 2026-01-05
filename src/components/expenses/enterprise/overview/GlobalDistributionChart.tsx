
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CountryData {
  country: string;
  percentage: number;
  color: string;
}

interface GlobalDistributionChartProps {
  data?: CountryData[];
  totalLocations?: number;
}

const COLORS = {
  'Deutschland': '#8B5CF6',
  'USA': '#60A5FA',
  'UK': '#F472B6',
  'Frankreich': '#34D399',
  'Schweiz': '#FB923C',
  'Sonstige': '#9CA3AF'
};

const GlobalDistributionChart = ({ data = [], totalLocations = 0 }: GlobalDistributionChartProps) => {
  const chartData = data.map(item => ({
    name: item.country,
    value: item.percentage,
    color: COLORS[item.country as keyof typeof COLORS] || item.color || '#9CA3AF'
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Globale Verteilung {totalLocations > 0 ? `(${totalLocations} Standorte)` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Anteil']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Keine Verteilungsdaten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalDistributionChart;
