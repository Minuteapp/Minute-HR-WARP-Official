import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface DepartmentData {
  name: string;
  completion: number;
}

interface DepartmentCompletionChartProps {
  data?: DepartmentData[];
}

export const DepartmentCompletionChart: React.FC<DepartmentCompletionChartProps> = ({ data }) => {
  const getBarColor = (completion: number) => {
    if (completion >= 90) return '#22c55e';
    if (completion >= 70) return '#f97316';
    return '#ef4444';
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Erfüllungsgrad nach Abteilung</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="completion" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.completion)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Keine Abteilungsdaten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
