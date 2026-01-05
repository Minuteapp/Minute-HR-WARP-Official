import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, FileDown, Share2, Clock, MapPin, Briefcase } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, differenceInMinutes } from "date-fns";
import { de } from "date-fns/locale";

const ReportsAnalytics = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [activeTab, setActiveTab] = useState("time");
  
  const months = timeRange === "1m" ? 1 : timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;

  // Lade Zeiterfassungsdaten (abgeschlossen)
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['time-entries-analytics', timeRange],
    queryFn: async () => {
      const startDate = subMonths(new Date(), months);
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('status', 'completed')
        .gte('start_time', startDate.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  // Lade Projektdaten für Namen
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Projekt-ID zu Name Mapping
  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p: any) => map.set(p.id, p.name));
    return map;
  }, [projects]);

  // Berechne monatliche Zeitdaten
  const monthlyTimeData = useMemo(() => {
    const monthMap = new Map<string, { entries: number; hours: number }>();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const key = format(date, 'MMM', { locale: de });
      monthMap.set(key, { entries: 0, hours: 0 });
    }

    timeEntries.forEach((entry: any) => {
      if (!entry.start_time || !entry.end_time) return;
      const date = new Date(entry.start_time);
      const key = format(date, 'MMM', { locale: de });
      if (monthMap.has(key)) {
        const stats = monthMap.get(key)!;
        stats.entries++;
        const minutes = differenceInMinutes(new Date(entry.end_time), new Date(entry.start_time)) - (entry.break_minutes || 0);
        stats.hours += Math.max(0, minutes / 60);
      }
    });

    return Array.from(monthMap.entries()).map(([month, stats]) => ({
      month,
      entries: stats.entries,
      hours: Math.round(stats.hours * 10) / 10
    }));
  }, [timeEntries, months]);

  // Berechne Arbeitsort-Verteilung
  const locationData = useMemo(() => {
    const locationMap = new Map<string, { count: number; hours: number }>();
    
    timeEntries.forEach((entry: any) => {
      if (!entry.start_time || !entry.end_time) return;
      const location = entry.location === 'office' ? 'Büro' : 
                       entry.location === 'home' ? 'Home Office' : 
                       entry.location === 'remote' ? 'Remote' : 
                       entry.location || 'Unbekannt';
      
      if (!locationMap.has(location)) {
        locationMap.set(location, { count: 0, hours: 0 });
      }
      const stats = locationMap.get(location)!;
      stats.count++;
      const minutes = differenceInMinutes(new Date(entry.end_time), new Date(entry.start_time)) - (entry.break_minutes || 0);
      stats.hours += Math.max(0, minutes / 60);
    });

    return Array.from(locationMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      hours: Math.round(stats.hours * 10) / 10
    }));
  }, [timeEntries]);

  // Berechne Projekt-Verteilung
  const projectData = useMemo(() => {
    const projectMap = new Map<string, { count: number; hours: number }>();
    
    timeEntries.forEach((entry: any) => {
      if (!entry.start_time || !entry.end_time) return;
      const projectId = entry.project || entry.project_id;
      let projectName = 'Kein Projekt';
      
      if (projectId && projectId !== 'none' && projectId !== 'general') {
        projectName = projectNameMap.get(projectId) || projectId;
      } else if (projectId === 'general') {
        projectName = 'Allgemein';
      }
      
      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, { count: 0, hours: 0 });
      }
      const stats = projectMap.get(projectName)!;
      stats.count++;
      const minutes = differenceInMinutes(new Date(entry.end_time), new Date(entry.start_time)) - (entry.break_minutes || 0);
      stats.hours += Math.max(0, minutes / 60);
    });

    return Array.from(projectMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        hours: Math.round(stats.hours * 10) / 10
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);
  }, [timeEntries, projectNameMap]);

  // Gesamtstatistiken
  const totalStats = useMemo(() => {
    let totalHours = 0;
    let totalEntries = timeEntries.length;
    
    timeEntries.forEach((entry: any) => {
      if (!entry.start_time || !entry.end_time) return;
      const minutes = differenceInMinutes(new Date(entry.end_time), new Date(entry.start_time)) - (entry.break_minutes || 0);
      totalHours += Math.max(0, minutes / 60);
    });

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalEntries,
      avgHoursPerEntry: totalEntries > 0 ? Math.round((totalHours / totalEntries) * 10) / 10 : 0
    };
  }, [timeEntries]);
  
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
  
  const config = {
    entries: {
      label: "Einträge",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))",
      },
    },
    hours: {
      label: "Stunden",
      theme: {
        light: "hsl(var(--chart-2))",
        dark: "hsl(var(--chart-2))",
      },
    },
  };

  const hasData = timeEntries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Zeiterfassung - Analysen & Berichte</h2>
          <p className="text-sm text-muted-foreground">
            Auswertung aller abgeschlossenen Zeiterfassungen
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Letzter Monat</SelectItem>
              <SelectItem value="3m">Letzte 3 Monate</SelectItem>
              <SelectItem value="6m">Letzte 6 Monate</SelectItem>
              <SelectItem value="1y">Letztes Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamtstunden</p>
                <p className="text-2xl font-bold">{totalStats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-chart-2/10">
                <BarChart3 className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zeiteinträge</p>
                <p className="text-2xl font-bold">{totalStats.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-chart-3/10">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ø Stunden/Eintrag</p>
                <p className="text-2xl font-bold">{totalStats.avgHoursPerEntry}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Zeiterfassungen vorhanden</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Sobald Zeiterfassungen abgeschlossen sind, werden sie hier analysiert.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Zeittrend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="h-5 w-5 mr-2" />
                Zeiterfassung im Verlauf
              </CardTitle>
              <CardDescription>
                Erfasste Stunden und Einträge pro Monat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer config={config}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="hours" 
                        name="Stunden"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="entries"
                        name="Einträge" 
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Arbeitsort und Projekte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Arbeitsort-Verteilung
                </CardTitle>
                <CardDescription>
                  Stunden nach Arbeitsort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {locationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, hours }) => `${name} (${hours}h)`}
                          outerRadius={100}
                          fill="hsl(var(--primary))"
                          dataKey="hours"
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}h`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Keine Arbeitsortdaten verfügbar
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Top Projekte
                </CardTitle>
                <CardDescription>
                  Stunden nach Projekt (Top 10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {projectData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={projectData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `${value}h`} />
                        <Bar dataKey="hours" name="Stunden" fill="hsl(var(--primary))" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Keine Projektdaten verfügbar
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsAnalytics;
