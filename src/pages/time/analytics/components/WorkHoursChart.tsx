
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeEntry } from "@/types/time-tracking.types";

interface WorkHoursChartProps {
  data: TimeEntry[];
  viewMode: 'day' | 'week' | 'month' | 'year';
}

const WorkHoursChart = ({ data, viewMode }: WorkHoursChartProps) => {
  // Aufbereitung der Daten je nach ausgewähltem Zeitraum
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    // Gruppiere nach Datum und berechne Stunden
    const dateGroups = data.reduce((groups, entry) => {
      let dateKey: string;
      const startDate = new Date(entry.start_time);
      
      // Format date key based on view mode
      switch (viewMode) {
        case 'day':
          dateKey = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          // Get week number
          const weekNum = Math.ceil((startDate.getDate() + 
            new Date(startDate.getFullYear(), startDate.getMonth(), 1).getDay()) / 7);
          dateKey = `KW ${weekNum}, ${startDate.toLocaleString('de-DE', { month: 'short' })}`;
          break;
        case 'month':
          dateKey = startDate.toLocaleString('de-DE', { month: 'short', year: 'numeric' });
          break;
        case 'year':
          dateKey = startDate.getFullYear().toString();
          break;
        default:
          dateKey = startDate.toISOString().split('T')[0];
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = { regular: 0, overtime: 0, break: 0 };
      }
      
      const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
      const durationHours = (endTime.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      
      // Pause abziehen, wenn vorhanden
      const breakHours = entry.break_minutes ? entry.break_minutes / 60 : 0;
      
      // Annahme: Reguläre Stunden vs. Überstunden (einfaches Beispiel)
      const regularHours = Math.min(8, durationHours - breakHours);
      const overtimeHours = Math.max(0, durationHours - breakHours - 8);
      
      groups[dateKey].regular += regularHours;
      groups[dateKey].overtime += overtimeHours;
      groups[dateKey].break += breakHours;
      
      return groups;
    }, {} as Record<string, { regular: number, overtime: number, break: number }>);
    
    // In Array für Recharts konvertieren
    return Object.entries(dateGroups).map(([date, hours]) => ({
      date,
      Regulär: parseFloat(hours.regular.toFixed(2)),
      Überstunden: parseFloat(hours.overtime.toFixed(2)),
      Pause: parseFloat(hours.break.toFixed(2))
    }));
  };
  
  const chartData = prepareChartData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Arbeitsstunden-Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  tick={{ fontSize: 12 }}
                  height={60}
                />
                <YAxis label={{ value: 'Stunden', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => [`${value} Stunden`, '']}
                  labelFormatter={(label) => `Datum: ${label}`}
                />
                <Legend />
                <Bar dataKey="Regulär" fill="#9b87f5" stackId="a" />
                <Bar dataKey="Überstunden" fill="#f59b87" stackId="a" />
                <Bar dataKey="Pause" fill="#87f59b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Keine Daten für den ausgewählten Zeitraum verfügbar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkHoursChart;
