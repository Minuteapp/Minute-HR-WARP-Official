
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ForecastChartProps {
  timeframe?: string;
}

const forecastData = [];

export const ForecastChart = ({ timeframe }: ForecastChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast-Verlauf {timeframe && `(${timeframe})`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
