
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActualVsBudgetChartProps {
  timeframe?: string;
}

const data = [
  { category: 'Personal', budget: 500000, actual: 480000 },
  { category: 'Marketing', budget: 200000, actual: 230000 },
  { category: 'IT', budget: 150000, actual: 145000 },
  { category: 'Verwaltung', budget: 100000, actual: 95000 },
  { category: 'Reisen', budget: 80000, actual: 75000 }
];

export const ActualVsBudgetChart = ({ timeframe }: ActualVsBudgetChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ist vs. Budget Vergleich {timeframe && `(${timeframe})`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#3B82F6" />
              <Bar dataKey="actual" name="Ist" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
