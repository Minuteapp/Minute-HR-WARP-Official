
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ForecastChartProps {
  timeframe: 'month' | 'quarter' | 'year';
}

export const ForecastChart = ({ timeframe }: ForecastChartProps) => {
  // Sample data - in real implementation, this would come from the API
  const data = [
    { period: 'Jan', budget: 200000, actual: 180000, forecast: 210000 },
    { period: 'Feb', budget: 220000, actual: 195000, forecast: 225000 },
    { period: 'Mär', budget: 240000, actual: 225000, forecast: 245000 },
    { period: 'Apr', budget: 230000, actual: 210000, forecast: 235000 },
    { period: 'Mai', budget: 250000, actual: 240000, forecast: 255000 },
    { period: 'Jun', budget: 260000, actual: null, forecast: 265000 },
    { period: 'Jul', budget: 270000, actual: null, forecast: 275000 },
    { period: 'Aug', budget: 280000, actual: null, forecast: 285000 },
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis 
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value: number) => [`€${value.toLocaleString()}`, '']}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="budget" 
            stackId="1" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.1}
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stackId="2" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.2}
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#F59E0B" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
