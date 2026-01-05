import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface TopRisksListProps {
  projects: any[];
}

export const TopRisksList = ({ projects }: TopRisksListProps) => {
  // Filtere Projekte mit hohem Risiko basierend auf echten Daten
  const riskyProjects = projects
    .filter(p => p.status === 'active' && (p.progress || 0) < 50)
    .slice(0, 4)
    .map(project => ({
      name: project.name,
      level: (project.progress || 0) < 25 ? 'Hohes Risiko' : 'Mittleres Risiko',
      percentage: project.progress || 0,
      color: (project.progress || 0) < 25 ? 'bg-red-500' : (project.progress || 0) < 50 ? 'bg-orange-500' : 'bg-yellow-500'
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Risiken</CardTitle>
      </CardHeader>
      <CardContent>
        {riskyProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Keine Risiken vorhanden</p>
            <p className="text-xs mt-1">Alle Projekte laufen planmäßig</p>
          </div>
        ) : (
          <div className="space-y-3">
            {riskyProjects.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{risk.name}</p>
                  <p className="text-sm text-muted-foreground">{risk.level}</p>
                </div>
                <Badge className={`${risk.color} text-white border-0`}>
                  {risk.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
