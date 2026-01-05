import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DiversityData {
  department: string;
  male: number;
  female: number;
}

interface DiversityChartProps {
  data?: DiversityData[];
}

export const DiversityChart: React.FC<DiversityChartProps> = ({ data }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Diversity nach Bereich</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="department" width={100} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="male" name="Männlich" stackId="a" fill="#3b82f6" />
                <Bar dataKey="female" name="Weiblich" stackId="a" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Keine Diversity-Daten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
