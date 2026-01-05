import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentPieChartProps {
  sentiment: {
    positive: number;
    neutral: number;
    critical: number;
  };
}

const COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  critical: '#EF4444'
};

export const SentimentPieChart = ({ sentiment }: SentimentPieChartProps) => {
  const data = [
    { name: 'Positiv', value: sentiment.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, color: COLORS.neutral },
    { name: 'Kritisch', value: sentiment.critical, color: COLORS.critical }
  ];

  const renderLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment-Analyse (Freitexte)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
