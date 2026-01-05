import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from "lucide-react";
import type { WorkforceAnalytics } from "@/hooks/useWorkforceData";

interface WorkforceChartProps {
  analytics: WorkforceAnalytics[];
}

export const WorkforceChart = ({ analytics }: WorkforceChartProps) => {
  if (analytics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine Analytics-Daten verfügbar</p>
      </div>
    );
  }

  const chartData = analytics.map(item => ({
    name: item.department_name || 'Unbekannt',
    employees: item.total_employees,
    satisfaction: item.satisfaction_score,
    productivity: item.productivity_score,
    turnover: item.turnover_rate
  }));

  const getBarColor = (turnover: number) => {
    if (turnover < 5) return "#22c55e"; // green
    if (turnover < 15) return "#eab308"; // yellow  
    return "#ef4444"; // red
  };

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm">Mitarbeiter: {data.employees}</p>
                      <p className="text-sm">Zufriedenheit: {data.satisfaction?.toFixed(1)}/10</p>
                      <p className="text-sm">Produktivität: {data.productivity?.toFixed(1)}/10</p>
                      <p className="text-sm">Fluktuation: {data.turnover?.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="employees" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.turnover)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Niedrige Fluktuation (&lt;5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Moderate Fluktuation (5-15%)</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Hohe Fluktuation (&gt;15%)</span>
          </div>
          <div className="text-muted-foreground">
            Balken zeigen Mitarbeiteranzahl
          </div>
        </div>
      </div>
    </div>
  );
};