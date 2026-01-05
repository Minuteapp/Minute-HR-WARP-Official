import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Users, 
  Flag,
  Calendar,
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Milestone {
  id: string;
  title: string;
  date: string;
  taskCount: number;
  status: 'Abgeschlossen' | 'In Arbeit' | 'Geplant';
}

interface Project {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  teamCount: number;
  milestoneCount: number;
  progress: number;
  milestones: Milestone[];
}

interface HierarchyViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export function HierarchyView({ projects, onProjectClick }: HierarchyViewProps) {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'In Arbeit': 'bg-blue-100 text-blue-700',
      'Planung': 'bg-purple-100 text-purple-700',
      'Abgeschlossen': 'bg-green-100 text-green-700',
      'Geplant': 'bg-gray-100 text-gray-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getMilestoneStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Abgeschlossen': 'bg-green-100 text-green-700',
      'In Arbeit': 'bg-blue-100 text-blue-700',
      'Geplant': 'bg-gray-100 text-gray-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-0">
      {projects.map((project, projectIndex) => {
        const isLast = projectIndex === projects.length - 1;
        
        return (
          <div key={project.id} className="flex">
            {/* Left side - Icon with vertical line */}
            <div className="flex flex-col items-center mr-4">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-white" />
              </div>
              {!isLast && (
                <div className="w-0.5 bg-primary/30 flex-1 min-h-[80px]" />
              )}
            </div>

            {/* Right side - Project Card */}
            <Card className="flex-1 mb-4 overflow-hidden">
              {/* Project Header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.startDate} - {project.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {project.teamCount} Mitarbeiter
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onProjectClick(project)}>
                        Projekt anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Fortschritt</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>

              {/* Milestones Section */}
              <div className="p-4 bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Meilensteine ({project.milestones.length})
                </h4>
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  {project.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 p-2 bg-background rounded-lg"
                    >
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'Abgeschlossen' 
                          ? 'bg-green-500 text-white' 
                          : milestone.status === 'In Arbeit'
                          ? 'bg-blue-500 text-white'
                          : 'border-2 border-gray-300 bg-white'
                      }`}>
                        {milestone.status === 'Abgeschlossen' && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{milestone.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{milestone.date}</span>
                          <span>•</span>
                          <span>{milestone.taskCount} Aufgaben</span>
                        </div>
                      </div>
                      <Badge className={`${getMilestoneStatusColor(milestone.status)} text-xs`}>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
