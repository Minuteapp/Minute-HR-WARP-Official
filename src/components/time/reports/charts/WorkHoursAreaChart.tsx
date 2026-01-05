import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WeeklyData } from '@/utils/timeReportCalculations';

interface WorkHoursAreaChartProps {
  data: WeeklyData[];
}

const WorkHoursAreaChart = ({ data }: WorkHoursAreaChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wöchentliche Arbeitsstunden</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="week" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Stunden', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`${value} h`, 'Stunden']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="hsl(217, 91%, 60%)" 
              fillOpacity={1} 
              fill="url(#colorHours)"
              name="Arbeitszeit"
            />
            <Area 
              type="monotone" 
              dataKey="target" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              fill="none"
              name="Soll"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WorkHoursAreaChart;
