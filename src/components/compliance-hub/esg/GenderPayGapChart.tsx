import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { Info } from 'lucide-react';

interface GenderPayGapData {
  department: string;
  gap: number;
}

interface GenderPayGapChartProps {
  data?: GenderPayGapData[];
  targetMax?: number;
}

export const GenderPayGapChart: React.FC<GenderPayGapChartProps> = ({ data, targetMax = 5 }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Gender Pay Gap nach Abteilung</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
                  <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="department" width={100} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <ReferenceLine x={targetMax} stroke="#ef4444" strokeDasharray="3 3" />
                  <Bar dataKey="gap" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-muted-foreground">
                Die rote Linie zeigt das Ziel von max. {targetMax}% Gender Pay Gap. Werte darüber erfordern Maßnahmen.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Keine Gender Pay Gap Daten verfügbar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
