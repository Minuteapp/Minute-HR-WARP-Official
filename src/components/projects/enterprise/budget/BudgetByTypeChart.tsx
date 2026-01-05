import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetByTypeData {
  category: string;
  plan: number;
  actual: number;
  forecast: number;
}

interface BudgetByTypeChartProps {
  data: BudgetByTypeData[];
}

const BudgetByTypeChart = ({ data }: BudgetByTypeChartProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Budget nach Projekttyp</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="category" className="text-xs" />
              <YAxis tickFormatter={(value) => `€${value}k`} className="text-xs" />
              <Tooltip 
                formatter={(value: number) => [`€${value}k`, '']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }}
              />
              <Legend />
              <Bar dataKey="plan" name="Plan" fill="#9ca3af" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Ist" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="forecast" name="Forecast" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Budget-Daten vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetByTypeChart;
