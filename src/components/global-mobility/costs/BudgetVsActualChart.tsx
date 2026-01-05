import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  month: string;
  budget: number;
  actual: number;
}

interface BudgetVsActualChartProps {
  data: ChartData[];
}

export const BudgetVsActualChart = ({ data }: BudgetVsActualChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget vs. Ist-Kosten</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Daten vorhanden
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => 
                  new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="hsl(var(--primary))" />
              <Bar dataKey="actual" name="Ist-Kosten" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
