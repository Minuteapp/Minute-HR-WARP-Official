import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DemandTimelineData {
  month: string;
  current: number;
  target: number;
  gap: number;
}

interface DemandTimelineChartProps {
  data?: DemandTimelineData[];
}

export const DemandTimelineChart = ({ data = [] }: DemandTimelineChartProps) => {
  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Zeitliche Staffelung des Bedarfs</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  name="Ist" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366F1' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="Soll" 
                  stroke="#A855F7" 
                  strokeWidth={2}
                  dot={{ fill: '#A855F7' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gap" 
                  name="Gap" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Zeitdaten vorhanden. Erfassen Sie Bedarfe mit Zeiträumen.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
