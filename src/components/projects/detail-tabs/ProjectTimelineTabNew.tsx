import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Circle, Calendar, TrendingUp } from 'lucide-react';

interface ProjectTimelineTabNewProps {
  project: any;
}

export const ProjectTimelineTabNew: React.FC<ProjectTimelineTabNewProps> = ({ project }) => {
  const milestones = [
    { id: 1, name: 'Kickoff Meeting', date: '01.01.2025', status: 'completed', statusLabel: 'Abgeschlossen', progress: 100 },
    { id: 2, name: 'Phase 1 Abschluss', date: '15.01.2025', status: 'completed', statusLabel: 'Abgeschlossen', progress: 100 },
    { id: 3, name: 'UAT Testing', date: '01.03.2025', status: 'in-progress', statusLabel: 'In Arbeit', progress: 65 },
    { id: 4, name: 'Go-Live', date: '15.05.2025', status: 'planned', statusLabel: 'Geplant', progress: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status: string, label: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white text-xs">{label}</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500 text-white text-xs">{label}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{label}</Badge>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '[&>div]:bg-green-500';
      case 'in-progress':
        return '[&>div]:bg-blue-500';
      default:
        return '[&>div]:bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Projektzeitraum & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projektzeitraum */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Projektzeitraum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Startdatum</span>
              <span className="text-sm font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '01.01.2025'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Enddatum</span>
              <span className="text-sm font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '31.12.2025'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Dauer</span>
              <span className="text-sm font-medium">365 Tage</span>
            </div>
          </CardContent>
        </Card>

        {/* Zeitplan-Status */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-green-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Zeitplan-Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600 mb-4">Das Projekt liegt im Zeitplan. Alle Meilensteine werden voraussichtlich rechtzeitig erreicht.</p>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Verbleibende Zeit</span>
                <span className="text-sm font-medium">78 Tage</span>
              </div>
              <Progress value={65} className="h-2 [&>div]:bg-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">65% der Projektlaufzeit abgeschlossen</p>
          </CardContent>
        </Card>
      </div>

      {/* Meilensteine */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Meilensteine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(milestone.status)}
                    {index < milestones.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${milestone.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{milestone.name}</span>
                        <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      </div>
                      {getStatusBadge(milestone.status, milestone.statusLabel)}
                    </div>
                    <Progress value={milestone.progress} className={`h-2 ${getProgressColor(milestone.status)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};