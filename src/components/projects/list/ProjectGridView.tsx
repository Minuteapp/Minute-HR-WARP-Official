import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit, DollarSign, Users } from 'lucide-react';
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

interface ProjectGridViewProps {
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

export const ProjectGridView = ({ projects, onViewProject, onEditProject }: ProjectGridViewProps) => {
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

  const getProjectLead = (index: number) => {
    return projectLeads[index % projectLeads.length];
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Keine Projekte vorhanden
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => {
        const projectLead = getProjectLead(index);
        const teamSize = project.team_members?.length || 12;
        const budgetUsed = project.progress || 62;
        const progress = project.progress || 0;
        const progressColor = progress >= 50 ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500';

        return (
          <div
            key={project.id}
            className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.project_type || 'IT'}</p>
              </div>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>

            {/* Avatar mit Name */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(projectLead)} flex items-center justify-center font-semibold text-white text-sm`}>
                {getInitials(projectLead)}
              </div>
              <div>
                <p className="text-sm font-medium">{projectLead}</p>
                <p className="text-xs text-muted-foreground">Projektleiter</p>
              </div>
            </div>

            {/* Fortschrittsbalken */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Fortschritt</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className={`h-2 ${progressColor}`} />
            </div>

            {/* Stats in zwei Spalten - gemäß Design */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">€{project.budget || 850}K</p>
                  <p className="text-xs text-muted-foreground">{budgetUsed}% verwendet</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{teamSize} Team</p>
                  <p className="text-xs text-muted-foreground">Mitglieder</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2" 
                onClick={() => onViewProject(project)}
              >
                <Eye className="h-4 w-4" />
                Ansehen
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => onEditProject(project)}
              >
                <Edit className="h-4 w-4" />
                Bearbeiten
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
