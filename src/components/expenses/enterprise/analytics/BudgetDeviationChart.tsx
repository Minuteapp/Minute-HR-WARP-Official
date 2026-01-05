
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetDeviationData {
  department: string;
  planned: number;
  actual: number;
}

interface BudgetDeviationChartProps {
  data: BudgetDeviationData[];
  onDetailsClick: () => void;
}

const BudgetDeviationChart = ({ data, onDetailsClick }: BudgetDeviationChartProps) => {
  const hasData = data.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Budgetabweichungen nach Abteilung
        </CardTitle>
        <button 
          onClick={onDetailsClick}
          className="text-sm font-medium text-primary hover:underline"
        >
          Details
        </button>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `€${value.toLocaleString('de-DE')}`}
              />
              <Legend />
              <Bar dataKey="planned" name="Geplant" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Ist" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Daten für den ausgewählten Zeitraum verfügbar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetDeviationChart;
