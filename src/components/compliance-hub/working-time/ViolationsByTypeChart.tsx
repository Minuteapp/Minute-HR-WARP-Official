// Compliance Hub - Verstöße nach Art (Horizontal Bar Chart)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface ViolationTypeData {
  type: string;
  count: number;
}

interface ViolationsByTypeChartProps {
  data?: ViolationTypeData[];
}

const typeColors: Record<string, string> = {
  'Ruhezeit': '#ef4444',
  'Maximalarbeitszeit': '#f97316',
  'Pausen': '#22c55e',
  'Sonntag/Feiertag': '#3b82f6'
};

export const ViolationsByTypeChart: React.FC<ViolationsByTypeChartProps> = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Verstöße nach Art</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Keine Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-base">Verstöße nach Art</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 12 }} width={75} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={typeColors[entry.type] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
