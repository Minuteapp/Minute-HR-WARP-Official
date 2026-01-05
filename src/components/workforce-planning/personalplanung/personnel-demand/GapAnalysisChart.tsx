import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GapAnalysisData {
  department: string;
  currentFTE: number;
  targetFTE: number;
  gap: number;
}

interface GapAnalysisChartProps {
  data?: GapAnalysisData[];
}

export const GapAnalysisChart = ({ data = [] }: GapAnalysisChartProps) => {
  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Gap-Analyse: Ist vs. Soll</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentFTE" name="Ist (FTE)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="targetFTE" name="Soll (FTE)" fill="#A855F7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gap" name="Gap (FTE)" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Daten vorhanden. Erfassen Sie Personalbedarfe, um die Gap-Analyse zu sehen.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
