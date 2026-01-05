
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  Target, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'planning';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  startDate?: string;
  endDate?: string;
  teamMembers: number;
  tasksCount: number;
  completedTasks: number;
}

interface ProjectGridProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export const ProjectGrid = ({ projects, onProjectClick }: ProjectGridProps) => {
  const getStatusConfig = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return { label: 'Aktiv', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { label: 'Abgeschlossen', color: 'bg-blue-100 text-blue-800' };
      case 'paused':
        return { label: 'Pausiert', color: 'bg-yellow-100 text-yellow-800' };
      case 'planning':
        return { label: 'Planung', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'Unbekannt', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPriorityConfig = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return { label: 'Hoch', color: 'bg-red-100 text-red-800' };
      case 'medium':
        return { label: 'Mittel', color: 'bg-orange-100 text-orange-800' };
      case 'low':
        return { label: 'Niedrig', color: 'bg-green-100 text-green-800' };
      default:
        return { label: 'Normal', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const statusConfig = getStatusConfig(project.status);
        const priorityConfig = getPriorityConfig(project.priority);
        
        return (
          <Card 
            key={project.id}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm"
            onClick={() => onProjectClick?.(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge className={cn("text-xs", statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", priorityConfig.color)}>
                  {priorityConfig.label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              
              {/* Statistiken */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{project.teamMembers}</p>
                  <p className="text-xs text-muted-foreground">Team</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    {project.completedTasks}/{project.tasksCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Aufgaben</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    }) : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                </div>
              </div>
              
              {/* Status Indikator */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {project.status === 'active' && <Clock className="h-4 w-4 text-blue-500" />}
                  {project.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {project.status === 'paused' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  {project.status === 'planning' && <Target className="h-4 w-4 text-purple-500" />}
                  <span className="text-xs">
                    {project.status === 'active' && 'In Bearbeitung'}
                    {project.status === 'completed' && 'Fertiggestellt'}
                    {project.status === 'paused' && 'Pausiert'}
                    {project.status === 'planning' && 'In Planung'}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  ID: {project.id}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
