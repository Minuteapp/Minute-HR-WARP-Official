import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

type ProjectStatus = 'on-track' | 'delayed' | 'critical';

interface Project {
  name: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  role: string;
}

export const EmployeeProjectsWidget: React.FC = () => {
  const projects: Project[] = [
    { name: 'Website Redesign', progress: 85, status: 'on-track', deadline: '15.02.2025', role: 'Lead Developer' },
    { name: 'Mobile App v2.0', progress: 45, status: 'delayed', deadline: '01.03.2025', role: 'Developer' },
    { name: 'API Integration', progress: 20, status: 'critical', deadline: '20.01.2025', role: 'Developer' },
    { name: 'Kundenprojekt ABC', progress: 100, status: 'on-track', deadline: 'Abgeschlossen', role: 'Support' },
  ];

  const onTrackCount = projects.filter(p => p.status === 'on-track').length;
  const delayedCount = projects.filter(p => p.status === 'delayed').length;
  const criticalCount = projects.filter(p => p.status === 'critical').length;

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'on-track':
        return (
          <Badge variant="outline" className="text-[9px] bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Im Plan
          </Badge>
        );
      case 'delayed':
        return (
          <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300 flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5" /> Verzögert
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="outline" className="text-[9px] bg-red-100 text-red-700 border-red-300 flex items-center gap-1">
            <XCircle className="h-2.5 w-2.5" /> Kritisch
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-indigo-600" />
            Meine Projekte
          </span>
          <div className="flex gap-2">
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{onTrackCount} Im Plan</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{delayedCount} Verzögert</span>
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{criticalCount} Kritisch</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project, index) => (
            <div key={index} className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-[10px] text-muted-foreground">{project.role}</p>
                </div>
                {getStatusBadge(project.status)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground w-8">{project.progress}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Deadline: {project.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
