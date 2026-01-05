
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeEntry } from "@/types/time-tracking.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ProjectTimeDistributionProps {
  data: TimeEntry[];
  dateRange: { from: Date; to: Date };
}

const ProjectTimeDistribution = ({ data, dateRange }: ProjectTimeDistributionProps) => {
  const [sortBy, setSortBy] = useState<'hours' | 'name'>('hours');
  
  const prepareProjectData = () => {
    if (!data || data.length === 0) return [];
    
    // Gruppiere nach Projekten
    const projectGroups = data.reduce((groups, entry) => {
      const project = entry.project || 'Nicht zugeordnet';
      
      if (!groups[project]) {
        groups[project] = 0;
      }
      
      const startTime = new Date(entry.start_time);
      const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Pause abziehen, wenn vorhanden
      const breakHours = entry.break_minutes ? entry.break_minutes / 60 : 0;
      groups[project] += (durationHours - breakHours);
      
      return groups;
    }, {} as Record<string, number>);
    
    // In Array für Recharts konvertieren
    let projectData = Object.entries(projectGroups).map(([name, hours]) => ({
      name,
      hours: parseFloat(hours.toFixed(2))
    }));
    
    // Sortieren nach ausgewähltem Kriterium
    if (sortBy === 'hours') {
      projectData = projectData.sort((a, b) => b.hours - a.hours);
    } else {
      projectData = projectData.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return projectData;
  };
  
  const projectData = prepareProjectData();
  
  // Datumsformatierung für den Header
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Zeitverteilung nach Projekten</h2>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'hours' | 'name')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hours">Nach Stunden</SelectItem>
            <SelectItem value="name">Nach Projektname</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Arbeitsstunden pro Projekt ({formatDate(dateRange.from)} - {formatDate(dateRange.to)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectData.length > 0 ? (
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Stunden', position: 'insideBottom', offset: -5 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} Stunden`, '']}
                    labelFormatter={(label) => `Projekt: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="hours" name="Arbeitsstunden" fill="#9b87f5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Keine Projektdaten für den ausgewählten Zeitraum verfügbar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProjectTimeDistribution;
