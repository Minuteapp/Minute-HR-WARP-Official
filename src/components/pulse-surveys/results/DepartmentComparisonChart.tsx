import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DepartmentComparisonChartProps {
  departments: Array<{
    name: string;
    count: number;
    engagement: number;
    workload: number;
    satisfaction: number;
  }>;
}

export const DepartmentComparisonChart = ({ departments }: DepartmentComparisonChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abteilungsvergleich</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departments}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="engagement" fill="#10B981" name="Engagement" />
            <Bar dataKey="workload" fill="#F59E0B" name="Workload Bewertung" />
            <Bar dataKey="satisfaction" fill="#3B82F6" name="Zufriedenheit" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
