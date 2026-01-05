import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/types/project';
import { DollarSign, Users, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAvatarColor, getInitials } from '@/utils/avatarUtils';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onView?: (project: Project) => void;
  onArchive?: (id: string) => void;
}

export const ProjectCard = ({ project, onEdit, onDelete, onView, onArchive }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleViewProject = () => {
    if (onView) {
      onView(project);
    } else {
      // Fallback: Navigate to project details if onView is not provided
      navigate(`/projects/${project.id}`);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-blue-500';
      case 'review':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'pending':
        return 'Planung';
      case 'review':
        return 'Review';
      case 'completed':
        return 'Abgeschlossen';
      case 'archived':
        return 'Archiviert';
      default:
        return status;
    }
  };

  const projectLead = 'Anna Schmidt';
  const teamSize = project.team_members?.length || 8;
  const budgetUsed = project.progress || 62;

  return (
    <Card className="bg-white border rounded-lg hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.category || 'Standard'}</p>
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
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Stats in zwei Spalten */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">€{project.budget || 0}K</span>
            <span className="text-xs text-muted-foreground ml-1">{budgetUsed}% verwendet</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{teamSize}</span>
            <span className="text-xs text-muted-foreground ml-1">Team</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewProject();
            }}
          >
            <Eye className="h-4 w-4" />
            Ansehen
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
            >
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
