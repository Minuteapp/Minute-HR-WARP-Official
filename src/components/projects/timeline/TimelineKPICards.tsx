import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface TimelineKPICardsProps {
  metrics: {
    totalProgress: number;
    completedTasks: { completed: number; total: number };
    atRiskTasks: number;
    activeTeams: number;
  };
}

export const TimelineKPICards = ({ metrics }: TimelineKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Gesamtfortschritt */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamtfortschritt</p>
              <p className="text-3xl font-bold">{metrics.totalProgress}%</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Abgeschlossen */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Abgeschlossen</p>
              <p className="text-3xl font-bold">
                {metrics.completedTasks.completed}/{metrics.completedTasks.total}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Gefährdet/Verzögert */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gefährdet/Verzögert</p>
              <p className="text-3xl font-bold text-orange-500">{metrics.atRiskTasks}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Aktive Teams */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Aktive Teams</p>
              <p className="text-3xl font-bold">{metrics.activeTeams}</p>
            </div>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
