
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TimeEntry } from "@/types/time-tracking.types";

interface TimeDistributionChartProps {
  data: TimeEntry[];
  viewMode: string;
}

const TimeDistributionChart = ({ data, viewMode }: TimeDistributionChartProps) => {
  const COLORS = ['#9b87f5', '#f59b87', '#87f59b', '#f587e4', '#87e4f5', '#e4f587'];
  
  // Gruppierung nach Kategorie (z.B. Standort oder Projekt)
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    // Gruppiere nach Kategorien und berechne die verbrachte Zeit
    const timeByCategory = data.reduce((groups, entry) => {
      // Primäre Kategorie: location falls vorhanden, sonst Projekt
      const category = entry.location || entry.project || 'Nicht kategorisiert';
      
      if (!groups[category]) {
        groups[category] = 0;
      }
      
      const startTime = new Date(entry.start_time);
      const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Pause abziehen, wenn vorhanden
      const breakHours = entry.break_minutes ? entry.break_minutes / 60 : 0;
      groups[category] += (durationHours - breakHours);
      
      return groups;
    }, {} as Record<string, number>);
    
    // In Array für Recharts konvertieren
    return Object.entries(timeByCategory)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value); // Sortieren nach Wert absteigend
  };
  
  const chartData = prepareChartData();
  
  // Berechne die Gesamtstunden
  const totalHours = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zeitverteilung nach Ort/Projekt</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} Stunden (${((value / totalHours) * 100).toFixed(1)}%)`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Details</h4>
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.value} Stunden</div>
                      <div className="text-sm text-muted-foreground">
                        {((item.value / totalHours) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Gesamtstunden:</span>
                  <span>{totalHours.toFixed(2)} Stunden</span>
                </div>
              </div>
            </div>
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

export default TimeDistributionChart;
