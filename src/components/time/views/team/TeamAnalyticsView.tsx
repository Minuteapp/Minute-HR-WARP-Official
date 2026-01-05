import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const weeklyHoursData = [
  { day: 'Mo', hours: 8.2 },
  { day: 'Di', hours: 7.8 },
  { day: 'Mi', hours: 8.5 },
  { day: 'Do', hours: 7.2 },
  { day: 'Fr', hours: 7.0 },
];

const teamMetrics = [
  { label: 'Durchschnittliche Produktivität', value: 91 },
  { label: 'Pünktlichkeit', value: 87 },
  { label: 'Anwesenheit', value: 96 },
];

const TeamAnalyticsView = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Team-Analysen</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arbeitsstunden diese Woche */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Arbeitsstunden diese Woche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyHoursData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[0, 12]}
                    ticks={[0, 3, 6, 9, 12]}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} h`, 'Stunden']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="#818cf8" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team-Metriken */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Team-Metriken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {teamMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="text-sm font-medium">{metric.value}%</span>
                </div>
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamAnalyticsView;
