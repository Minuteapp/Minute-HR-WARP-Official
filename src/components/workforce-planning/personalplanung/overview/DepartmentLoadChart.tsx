import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight } from "lucide-react";

interface DepartmentLoadData {
  department: string;
  percentage: number;
}

interface DepartmentLoadChartProps {
  data?: DepartmentLoadData[];
}

const getBarColor = (percentage: number) => {
  if (percentage > 100) return "#EF4444"; // red
  if (percentage >= 90) return "#F97316"; // orange
  return "#10B981"; // green
};

export const DepartmentLoadChart = ({ data = [] }: DepartmentLoadChartProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Abteilungen</CardTitle>
        <a href="#" className="text-sm text-purple-600 font-medium hover:underline flex items-center gap-1">
          Alle
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
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis 
                type="number" 
                domain={[0, 120]}
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category"
                dataKey="department" 
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }}
                formatter={(value: number) => [`${value}%`, 'Auslastung']}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
