
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const scenarioData = [
  { category: 'Personal', base: 50000, optimistic: 48000, pessimistic: 52000 },
  { category: 'Marketing', base: 20000, optimistic: 22000, pessimistic: 18000 },
  { category: 'IT', base: 15000, optimistic: 14000, pessimistic: 16000 },
];

export const ScenarioComparison = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szenario-Vergleich</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Bar dataKey="base" name="Basis" fill="#3B82F6" />
              <Bar dataKey="optimistic" name="Optimistisch" fill="#10B981" />
              <Bar dataKey="pessimistic" name="Pessimistisch" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
