import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WellbeingData {
  month: string;
  sickDays: number;
  burnoutRisk: number;
}

interface WellbeingTrendChartProps {
  data?: WellbeingData[];
}

export const WellbeingTrendChart: React.FC<WellbeingTrendChartProps> = ({ data }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Wellbeing & Gesundheitstrend</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sickDays" 
                  name="Ø Krankheitstage" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="burnoutRisk" 
                  name="MA mit Burnout-Risiko" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Keine Wellbeing-Daten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
