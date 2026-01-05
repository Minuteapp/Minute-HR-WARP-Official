import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function PerformanceDistributionChart() {
  const { data: companyPerformance } = useQuery({
    queryKey: ["performance-distribution-chart"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_performance")
        .select("top_performers, needs_development, total_employees")
        .eq("period", "current")
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const topPerformers = companyPerformance?.top_performers || 0;
  const needsDevelopment = companyPerformance?.needs_development || 0;
  const totalEmployees = companyPerformance?.total_employees || 0;
  const stable = totalEmployees - topPerformers - needsDevelopment;

  const chartData = [
    { name: "Stabile Entwicklung", value: stable > 0 ? stable : 0, color: "#94a3b8" },
    { name: "Stark entwicklungsbedürftig", value: needsDevelopment, color: "#f97316" }
  ];

  if (totalEmployees === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance-Verteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Keine Daten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance-Verteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
