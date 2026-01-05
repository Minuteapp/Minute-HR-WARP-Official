import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowRight } from "lucide-react";

interface HeadcountTrendData {
  month: string;
  planned: number;
  actual: number;
}

interface HeadcountChartProps {
  data?: HeadcountTrendData[];
}

export const HeadcountChart = ({ data = [] }: HeadcountChartProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Headcount-Entwicklung</CardTitle>
        <a href="#" className="text-sm text-purple-600 font-medium hover:underline flex items-center gap-1">
          Details
          <ArrowRight className="h-3 w-3" />
        </a>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
            <p>Keine Daten verfügbar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="planned" 
                name="Geplant"
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6' }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Ist"
                stroke="#6366F1" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#6366F1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
