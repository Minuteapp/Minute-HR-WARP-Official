import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnterpriseBudgetVsProgress = () => {
  // Empty state - no mock data
  const data: { name: string; budgetUsed: number; progress: number }[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget vs. Fortschritt</CardTitle>
        <p className="text-sm text-muted-foreground">
          Effizienz-Analyse aktiver Projekte
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Keine Projektdaten für die Analyse verfügbar</p>
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
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="budgetUsed" name="Budget verbraucht" fill="hsl(0, 84%, 60%)" />
              <Bar dataKey="progress" name="Fortschritt %" fill="hsl(142, 76%, 36%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseBudgetVsProgress;
