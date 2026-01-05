
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  budget?: number;
  budget_spent?: number;
  created_at: string;
}

interface ProjectHealthGridProps {
  projects: Project[];
}

export const ProjectHealthGrid: React.FC<ProjectHealthGridProps> = ({ projects }) => {
  const getHealthStatus = (project: Project) => {
    const progressScore = project.progress;
    const budgetScore = project.budget && project.budget_spent 
      ? ((project.budget - project.budget_spent) / project.budget) * 100 
      : 100;
    
    const overallHealth = (progressScore + budgetScore) / 2;
    
    if (overallHealth >= 80) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (overallHealth >= 60) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (overallHealth >= 40) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'good':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Ausgezeichnet';
      case 'good':
        return 'Gut';
      case 'warning':
        return 'Warnung';
      case 'critical':
        return 'Kritisch';
      default:
        return 'Unbekannt';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return priority;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const health = getHealthStatus(project);
        const budgetUsage = project.budget && project.budget_spent 
          ? (project.budget_spent / project.budget) * 100 
          : 0;

        return (
          <Card key={project.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold truncate">
                  {project.name}
                </CardTitle>
                {getStatusIcon(health.status)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getPriorityColor(project.priority)}>
                  {getPriorityLabel(project.priority)}
                </Badge>
                <Badge variant="outline" className={health.color}>
                  {getStatusLabel(health.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fortschritt</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              
              {project.budget && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget verwendet</span>
                    <span>{budgetUsage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={budgetUsage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>€{(project.budget_spent || 0).toLocaleString()}</span>
                    <span>€{project.budget.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Status: {project.status === 'active' ? 'Aktiv' : 
                         project.status === 'completed' ? 'Abgeschlossen' :
                         project.status === 'pending' ? 'Geplant' : 
                         project.status}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
