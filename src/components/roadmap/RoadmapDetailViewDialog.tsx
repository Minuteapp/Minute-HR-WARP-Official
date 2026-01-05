import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  Grid3X3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Circle,
  X
} from 'lucide-react';

interface RoadmapDetailViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmap: {
    id: string;
    title: string;
    description: string;
    status: string;
    period?: string;
    team?: string;
    responsible?: string;
    projectCount?: number;
  } | null;
}

export const RoadmapDetailViewDialog: React.FC<RoadmapDetailViewDialogProps> = ({
  open,
  onOpenChange,
  roadmap
}) => {
  if (!roadmap) return null;

  const infoBoxes = [
    { icon: Calendar, label: 'Zeitraum', value: '1. Jan. 2025 bis 31. Dez. 2025', subtext: '' },
    { icon: Users, label: 'Team', value: roadmap.team || 'Executive Board', subtext: roadmap.responsible || 'Dr. Martin Richter' },
    { icon: Grid3X3, label: 'Projekte', value: '2', subtext: '2 aktiv' },
    { icon: TrendingUp, label: 'Ø Fortschritt', value: '54%', subtext: '2/7 Meilensteine' },
  ];

  const projects = [
    { name: 'Phoenix', status: 'aktiv', statusColor: 'border-green-500 text-green-700', delayed: true, progress: 45, period: 'Nov. 2025 - Feb. 2026' },
    { name: 'Digital Transformation', status: 'aktiv', statusColor: 'border-green-500 text-green-700', delayed: false, progress: 62, period: 'Nov. 2025 - Apr. 2026' },
  ];

  const milestones = [
    { name: 'Projektstart', project: 'Phoenix', date: '01.11.2025', completed: true },
    { name: 'Anforderungsanalyse', project: 'Digital Transformation', date: '15.11.2025', completed: true },
    { name: 'Prototyp fertig', project: 'Phoenix', date: '15.01.2026', completed: false },
    { name: 'Beta-Version', project: 'Phoenix', date: '01.02.2026', completed: false },
    { name: 'Cloud Migration Phase 1', project: 'Digital Transformation', date: '01.02.2026', completed: false },
    { name: 'Go-Live', project: 'Phoenix', date: '28.02.2026', completed: false },
    { name: 'Abschluss', project: 'Digital Transformation', date: '30.04.2026', completed: false },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">{roadmap.title}</DialogTitle>
              <Badge variant="outline" className="border-green-500 text-green-700">aktiv</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{roadmap.description}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Boxes Grid */}
          <div className="grid grid-cols-4 gap-4">
            {infoBoxes.map((box, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <box.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{box.label}</span>
                  </div>
                  <p className="font-semibold">{box.value}</p>
                  {box.subtext && <p className="text-xs text-muted-foreground">{box.subtext}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Zeitlicher Fortschritt */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zeitlicher Fortschritt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Zeitfortschritt</span>
                  <span className="font-medium">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Arbeitsfortschritt</span>
                  <span className="font-medium">54%</span>
                </div>
                <Progress value={54} className="h-2" />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  Arbeitsfortschritt liegt 42% hinter dem Zeitplan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verknüpfte Projekte */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verknüpfte Projekte (2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 text-blue-500 fill-blue-500" />
                    <span className="font-medium">{project.name}</span>
                    <Badge variant="outline" className={project.statusColor}>{project.status}</Badge>
                    {project.delayed && (
                      <Badge variant="outline" className="border-red-500 text-red-700">Verzögert</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pl-5">
                    <span className="text-sm text-muted-foreground">Fortschritt</span>
                    <div className="flex-1 flex items-center gap-2">
                      <Progress value={project.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{project.period}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alle Meilensteine */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Alle Meilensteine (2/7 erreicht)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {milestone.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">{milestone.project} • {milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">1 von 2 Projekten sind verzögert</p>
                <p className="text-sm text-red-700 mt-1">
                  Überprüfen Sie die Ressourcen und Abhängigkeiten dieser Projekte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
