import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  priority?: string;
  progress?: number;
  delay_probability?: number;
  owner_name?: string;
}

interface TopCriticalProjectsProps {
  projects: Project[];
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'at-risk': return 'destructive';
    case 'delayed': return 'destructive';
    case 'on-hold': return 'secondary';
    default: return 'default';
  }
};

const getPriorityVariant = (priority?: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

export const TopCriticalProjects = ({ projects }: TopCriticalProjectsProps) => {
  const criticalProjects = projects
    .filter(p => 
      p.status === 'at-risk' || 
      p.status === 'delayed' || 
      p.priority === 'high' ||
      (p.delay_probability && p.delay_probability > 0.5)
    )
    .sort((a, b) => (b.delay_probability || 0) - (a.delay_probability || 0))
    .slice(0, 5);

  if (criticalProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Top kritische Projekte
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          Keine kritischen Projekte
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Top kritische Projekte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criticalProjects.map((project) => (
          <div key={project.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate max-w-[150px]">
                {project.name}
              </span>
              <div className="flex gap-1">
                <Badge variant={getStatusVariant(project.status)} className="text-xs">
                  {project.status}
                </Badge>
                {project.priority && (
                  <Badge variant={getPriorityVariant(project.priority)} className="text-xs">
                    {project.priority}
                  </Badge>
                )}
              </div>
            </div>
            {project.owner_name && (
              <p className="text-xs text-muted-foreground">{project.owner_name}</p>
            )}
            <div className="space-y-1">
              <Progress value={project.progress || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Fortschritt: {project.progress || 0}%
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
