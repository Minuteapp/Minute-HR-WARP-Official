
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostTrendData {
  month: string;
  arbeitsmittel: number;
  bewirtung: number;
  reisekosten: number;
  software: number;
}

interface CostTrendChartProps {
  data: CostTrendData[];
  onDetailsClick: () => void;
}

const CostTrendChart = ({ data, onDetailsClick }: CostTrendChartProps) => {
  const hasData = data.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Kostenentwicklung nach Kategorie
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
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="arbeitsmittel" name="Arbeitsmittel" stroke="#F472B6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="bewirtung" name="Bewirtung" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="reisekosten" name="Reisekosten" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="software" name="Software" stroke="#F9A8D4" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
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

export default CostTrendChart;
