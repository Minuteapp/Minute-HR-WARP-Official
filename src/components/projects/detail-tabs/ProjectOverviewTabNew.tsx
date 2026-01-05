import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, FileText, BarChart3 } from 'lucide-react';

interface ProjectOverviewTabNewProps {
  project: any;
}

export const ProjectOverviewTabNew: React.FC<ProjectOverviewTabNewProps> = ({ project }) => {
  const activities = [
    { id: 1, text: 'Neue Aufgabe "API Integration" erstellt', time: 'vor 2 Stunden', color: 'bg-blue-500' },
    { id: 2, text: 'Meilenstein "Phase 1" abgeschlossen', time: 'vor 5 Stunden', color: 'bg-green-500' },
    { id: 3, text: 'Budget-Update: €50K hinzugefügt', time: 'gestern', color: 'bg-yellow-500' },
    { id: 4, text: 'Neues Team-Mitglied hinzugefügt', time: 'vor 2 Tagen', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Roadmap-Zuordnung */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Roadmap-Zuordnung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Gehört zur Roadmap:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Q1-Q4 2025: Digital Transformation
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              Initiative #1
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Verknüpft mit der Unternehmens-Roadmap</span>
            </div>
            <Button variant="outline" size="sm">
              Roadmap ansehen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projektbeschreibung */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Projektbeschreibung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description || 'Dieses Projekt zielt darauf ab, die digitale Infrastruktur des Unternehmens zu modernisieren. Es umfasst die Migration auf Cloud-Dienste, die Implementierung neuer Sicherheitsmaßnahmen und die Optimierung bestehender Prozesse für mehr Effizienz und Skalierbarkeit.'}
          </p>
        </CardContent>
      </Card>

      {/* Zwei-Spalten Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projekt-Informationen */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Projekt-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Projektname</span>
              <span className="text-sm font-medium">{project.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Abteilung</span>
              <span className="text-sm font-medium">{project.category || 'IT & Technologie'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-green-500 text-white hover:bg-green-600">Aktiv</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Projekt-ID</span>
              <span className="text-sm font-medium text-muted-foreground">{project.id?.slice(0, 8) || 'PRJ-001'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance-Metriken */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance-Metriken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Zeitfortschritt</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Aufgabenfortschritt</span>
                <span className="text-sm font-medium">{project.progress || 45}%</span>
              </div>
              <Progress value={project.progress || 45} className="h-2 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Budget-Nutzung</span>
                <span className="text-sm font-medium">62%</span>
              </div>
              <Progress value={62} className="h-2 [&>div]:bg-green-500" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">SPI:</span>
                <span className="text-sm font-semibold text-green-600">0.92</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">CPI:</span>
                <span className="text-sm font-semibold text-green-600">1.08</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Letzte Aktivitäten */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};