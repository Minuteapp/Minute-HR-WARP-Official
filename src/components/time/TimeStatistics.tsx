import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TimeStatistics = () => {
  const { data: statisticsData } = useQuery({
    queryKey: ['time-statistics'],
    queryFn: async () => {
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('status', 'completed');

      if (error) throw error;

      // Verarbeite Daten für Charts
      const currentWeek = new Date();
      const weekStart = new Date(currentWeek);
      weekStart.setDate(currentWeek.getDate() - currentWeek.getDay());

      // Tägliche Arbeitszeiten der letzten 7 Tage
      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        
        const dayEntries = (timeEntries || []).filter(entry => {
          const entryDate = new Date(entry.start_time);
          return entryDate.toDateString() === date.toDateString();
        });

        const totalMinutes = dayEntries.reduce((total, entry) => {
          if (entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            const diffMs = end.getTime() - start.getTime();
            return total + Math.floor(diffMs / 60000);
          }
          return total;
        }, 0);

        return {
          day: dayName,
          hours: Math.round((totalMinutes / 60) * 10) / 10,
          minutes: totalMinutes
        };
      });

      // Projekt-Verteilung
      const projectMap = new Map();
      (timeEntries || []).forEach(entry => {
        const project = entry.project_name || 'Ohne Projekt';
        if (entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const diffMs = end.getTime() - start.getTime();
          const hours = diffMs / 3600000;
          
          projectMap.set(project, (projectMap.get(project) || 0) + hours);
        }
      });

      const projectData = Array.from(projectMap.entries()).map(([name, hours]) => ({
        name,
        hours: Math.round(hours * 10) / 10,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }));

      // Gesamtstatistiken
      const totalMinutes = (timeEntries || []).reduce((total, entry) => {
        if (entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const diffMs = end.getTime() - start.getTime();
          return total + Math.floor(diffMs / 60000);
        }
        return total;
      }, 0);

      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
      const avgHoursPerDay = dailyData.reduce((sum, day) => sum + day.hours, 0) / 7;

      return {
        daily: dailyData,
        projects: projectData,
        totalHours,
        avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
        totalEntries: (timeEntries || []).length
      };
    }
  });

  if (!statisticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Übersicht KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Stunden</p>
                <p className="text-2xl font-bold">{statisticsData.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Stunden/Tag</p>
                <p className="text-2xl font-bold">{statisticsData.avgHoursPerDay}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Einträge</p>
                <p className="text-2xl font-bold">{statisticsData.totalEntries}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projekte</p>
                <p className="text-2xl font-bold">{statisticsData.projects.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tägliche Arbeitszeiten */}
        <Card>
          <CardHeader>
            <CardTitle>Arbeitszeiten der letzten 7 Tage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statisticsData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}h`, 'Stunden']}
                  />
                  <Bar dataKey="hours" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projekt-Verteilung */}
        <Card>
          <CardHeader>
            <CardTitle>Zeitverteilung nach Projekt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statisticsData.projects}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, hours }) => `${name}: ${hours}h`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {statisticsData.projects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}h`, 'Stunden']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};