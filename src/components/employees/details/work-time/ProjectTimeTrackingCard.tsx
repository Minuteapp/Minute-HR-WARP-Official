import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ProjectTimeData {
  project?: string;
  projects?: { id: string; name: string };
  start_time: string;
  end_time?: string;
  break_minutes?: number;
}

interface ProjectTimeTrackingCardProps {
  projectTimeData: ProjectTimeData[];
}

const projectColors = [
  'bg-primary',
  'bg-orange-500',
  'bg-gray-400',
  'bg-green-500',
  'bg-purple-500',
];

export const ProjectTimeTrackingCard = ({ projectTimeData }: ProjectTimeTrackingCardProps) => {
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: de });
  
  const projectHours = projectTimeData.reduce((acc, entry) => {
    const projectName = entry.projects?.name || entry.project || 'Nicht zugeordnet';
    
    if (entry.end_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
      const breakMinutes = entry.break_minutes || 0;
      const hours = (minutes - breakMinutes) / 60;
      
      acc[projectName] = (acc[projectName] || 0) + hours;
    }
    
    return acc;
  }, {} as Record<string, number>);

  const totalHours = Object.values(projectHours).reduce((sum, hours) => sum + hours, 0);

  const projectsWithPercentage = Object.entries(projectHours)
    .map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 10) / 10,
      percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0
    }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Projektzeiterfassung ({currentMonth})
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Vorschau
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectsWithPercentage.length > 0 ? (
          <>
            {projectsWithPercentage.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{project.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {project.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{project.hours}h</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${projectColors[index % projectColors.length]}`}
                    style={{ width: `${project.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-sm font-medium">Gesamt (Monat)</span>
              <span className="text-lg font-bold">{totalHours.toFixed(1)}h</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keine Projektzeiterfassung für diesen Monat
          </p>
        )}
      </CardContent>
    </Card>
  );
};
