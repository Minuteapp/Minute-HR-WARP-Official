import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceHistoryChartProps {
  historyData: any[];
}

export const PerformanceHistoryChart = ({ historyData }: PerformanceHistoryChartProps) => {
  const chartData = historyData.map((item, idx) => {
    const prevScore = idx > 0 ? parseFloat(historyData[idx - 1].overall_score) : 0;
    const currentScore = parseFloat(item.overall_score);
    const growth = idx > 0 ? currentScore - prevScore : currentScore - 74; // baseline

    return {
      year: item.year,
      score: currentScore,
      growth: growth.toFixed(0),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Performance-Entwicklung (5 Jahre)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {chartData.map((item) => (
            <Card key={item.year} className="bg-muted/30">
              <CardContent className="pt-4 text-center">
                <div className="text-lg font-bold">{item.year}</div>
                <div className="text-2xl font-bold text-primary">{item.score}%</div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +{item.growth}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
