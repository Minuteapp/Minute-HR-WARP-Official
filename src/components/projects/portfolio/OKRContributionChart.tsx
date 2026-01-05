import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface OKRContributionChartProps {
  projects: any[];
}

export const OKRContributionChart = ({ projects }: OKRContributionChartProps) => {
  // Gruppiere Projekte nach Typ und berechne durchschnittlichen Fortschritt
  const projectsByType = projects.reduce((acc, project) => {
    const type = project.project_type || 'Sonstige';
    if (!acc[type]) {
      acc[type] = { projects: 0, totalProgress: 0 };
    }
    acc[type].projects += 1;
    acc[type].totalProgress += project.progress || 0;
    return acc;
  }, {} as Record<string, { projects: number; totalProgress: number }>);

  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
  
  const okrData = Object.entries(projectsByType).map(([type, data], index) => {
    const typedData = data as { projects: number; totalProgress: number };
    return {
      name: type,
      projects: typedData.projects,
      progress: Math.round(typedData.totalProgress / typedData.projects),
      color: colors[index % colors.length]
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projektfortschritt nach Typ</CardTitle>
      </CardHeader>
      <CardContent>
        {okrData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Keine Projektdaten vorhanden</p>
            <p className="text-xs mt-1">Erstellen Sie Projekte, um Fortschritte zu sehen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {okrData.map((okr, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{okr.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {okr.projects} {okr.projects === 1 ? 'Projekt' : 'Projekte'} · {okr.progress}%
                    </p>
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${okr.progress}%`,
                      backgroundColor: okr.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
