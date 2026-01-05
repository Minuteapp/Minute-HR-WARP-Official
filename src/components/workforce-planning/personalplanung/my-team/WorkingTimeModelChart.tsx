import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface WorkingTimeModelData {
  name: string;
  value: number;
  percentage: number;
}

interface WorkingTimeModelChartProps {
  data?: WorkingTimeModelData[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

export const WorkingTimeModelChart = ({ data = [] }: WorkingTimeModelChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Arbeitszeitmodelle</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
            <p>Keine Daten verfügbar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${props.payload.percentage}%`,
                  props.payload.name
                ]}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value, entry: any) => (
                  <span className="text-sm">
                    {entry.payload.name}: {entry.payload.percentage}%
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
