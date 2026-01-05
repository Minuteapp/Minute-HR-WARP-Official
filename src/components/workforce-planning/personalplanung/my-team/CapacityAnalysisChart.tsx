import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TeamCapacityData {
  teamName: string;
  availableHours: number;
  boundHours: number;
}

interface CapacityAnalysisChartProps {
  data?: TeamCapacityData[];
}

export const CapacityAnalysisChart = ({ data = [] }: CapacityAnalysisChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Kapazitätsanalyse nach Team</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
            <p>Keine Daten verfügbar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="teamName" 
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }}
                formatter={(value: number) => [`${value.toLocaleString()} h`]}
              />
              <Legend />
              <Bar 
                dataKey="availableHours" 
                name="Verfügbar (h)"
                fill="#6366F1" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="boundHours" 
                name="Gebunden (h)"
                fill="#A855F7" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
