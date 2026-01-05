import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function DimensionsDetailChart() {
  const { data: companyPerformance } = useQuery({
    queryKey: ["dimensions-detail-chart"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_performance")
        .select("goals_score, tasks_score, feedback_score, development_score")
        .eq("period", "current")
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const chartData = [
    { name: "Ziele", score: companyPerformance?.goals_score || 0, color: "#a855f7" },
    { name: "Aufgaben", score: companyPerformance?.tasks_score || 0, color: "#ec4899" },
    { name: "Feedback", score: companyPerformance?.feedback_score || 0, color: "#06b6d4" },
    { name: "Entwicklung", score: companyPerformance?.development_score || 0, color: "#22c55e" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dimensionen im Detail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
