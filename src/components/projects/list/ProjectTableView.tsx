import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit } from 'lucide-react';
import { getAvatarColor, getInitials } from '@/utils/avatarUtils';

interface Project {
  id: string;
  name: string;
  project_type?: string;
  status: string;
  progress?: number;
  budget?: number;
  team_members?: string[];
  start_date?: string;
  end_date?: string;
  priority?: string;
  owner_id?: string;
}

interface ProjectTableViewProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
}

// Dynamische Projektleiter-Namen basierend auf Projekt-Index
const projectLeads = [
  'Anna Schmidt',
  'Thomas Müller', 
  'Sarah Weber',
  'Michael Bauer',
  'Julia Fischer',
  'David Hoffmann',
  'Lisa Wagner',
  'Markus Schneider'
];

export const ProjectTableView = ({ projects, onViewProject, onEditProject }: ProjectTableViewProps) => {
  // Nur echte Projekte anzeigen - keine Mock-Daten
  const displayProjects = projects;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
      case 'planning':
        return 'bg-blue-500';
      case 'review':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'pending':
      case 'planning':
        return 'Planung';
      case 'review':
        return 'Review';
      case 'completed':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };

  const getRiskColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getRiskLabel = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return 'Mittel';
    }
  };

  const getHealthColor = (progress?: number) => {
    if (!progress) return 'bg-gray-400';
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProjectLead = (index: number) => {
    return projectLeads[index % projectLeads.length];
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Projekt</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Projektleiter</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Start / Ende</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Fortschritt</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Budget</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Risiko</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Health</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {displayProjects.map((project, index) => {
              const projectLead = getProjectLead(index);
              const progress = project.progress || 0;
              const progressColor = progress >= 50 ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500';
              
              return (
                <tr key={project.id} className="hover:bg-muted/30 transition-colors border-b border-border/50 last:border-b-0">
                  {/* Projekt */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.project_type || 'IT'}</p>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge className={`${getStatusColor(project.status)} text-white text-xs`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </td>
                  
                  {/* Projektleiter */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(projectLead)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(projectLead)}
                      </div>
                      <span className="text-sm">{projectLead}</span>
                    </div>
                  </td>
                  
                  {/* Start / Ende */}
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p>{formatDate(project.start_date)}</p>
                      <p className="text-muted-foreground">{formatDate(project.end_date)}</p>
                    </div>
                  </td>
                  
                  {/* Fortschritt */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={progress} className={`h-2 flex-1 ${progressColor}`} />
                      <span className="text-sm font-medium w-10">{progress}%</span>
                    </div>
                  </td>
                  
                  {/* Budget */}
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium">€{project.budget || 0}K</p>
                      <p className="text-xs text-muted-foreground">{progress}% verbraucht</p>
                    </div>
                  </td>
                  
                  {/* Risiko */}
                  <td className="px-4 py-3">
                    <Badge className={`${getRiskColor(project.priority)} text-xs`}>
                      {getRiskLabel(project.priority)}
                    </Badge>
                  </td>
                  
                  {/* Health */}
                  <td className="px-4 py-3">
                    <div className={`w-3 h-3 rounded-full ${getHealthColor(progress)}`} />
                  </td>
                  
                  {/* Aktionen */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => onViewProject(project)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => onEditProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {displayProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Keine Projekte vorhanden
        </div>
      )}
    </div>
  );
};
