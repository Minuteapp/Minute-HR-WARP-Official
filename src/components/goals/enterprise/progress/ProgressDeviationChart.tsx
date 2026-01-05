import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartDataItem {
  name: string;
  current: number;
  target: number;
}

interface ProgressDeviationChartProps {
  data: ChartDataItem[];
}

export const ProgressDeviationChart = ({ data }: ProgressDeviationChartProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Fortschrittsabweichungen nach Zielen</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Keine Daten verfügbar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="current" 
                name="Aktueller Fortschritt" 
                fill="hsl(221, 83%, 53%)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="target" 
                name="Soll-Fortschritt" 
                fill="hsl(0, 0%, 70%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
