import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, TrendingUp, DollarSign, Users, Calendar, CheckSquare, Loader2 } from 'lucide-react';
import ProjectStatusBadge from './ProjectStatusBadge';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { useProjects } from '@/hooks/projects/useProjects';
import { useAuth } from '@/contexts/AuthContext';

interface EnterpriseProject {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'active' | 'at-risk' | 'delayed' | 'on-hold' | 'completed' | 'planning' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number;
  budgetSpent: number;
  budgetPlanned: number;
  budgetDeviation: number;
  ownerName: string;
  teamMemberCount: number;
  deadline: string;
  daysOverdue?: number;
  tasksCompleted: number;
  tasksTotal: number;
}

const priorityConfig: Record<string, { label: string; dotColor: string }> = {
  critical: { label: 'Kritisch', dotColor: 'bg-red-500' },
  high: { label: 'Hoch', dotColor: 'bg-orange-500' },
  medium: { label: 'Mittel', dotColor: 'bg-yellow-500' },
  low: { label: 'Niedrig', dotColor: 'bg-green-500' },
};

const EnterpriseProjectCard = ({ project }: { project: EnterpriseProject }) => {
  const priority = priorityConfig[project.priority] || priorityConfig.medium;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
            {project.category}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Title & Description */}
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {project.description}
            </p>
          )}
        </div>
        
        {/* Status & Priority */}
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <Badge variant="outline" className="text-xs gap-1">
            <span className={`w-2 h-2 rounded-full ${priority.dotColor}`} />
            {priority.label}
          </Badge>
        </div>
        
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Fortschritt
            </span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        {/* Budget */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            Budget
          </span>
          <div>
            <span className="font-medium">{project.budgetSpent}k €</span>
            <span className={`ml-1 ${project.budgetDeviation < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {project.budgetDeviation > 0 ? '+' : ''}{project.budgetDeviation}%
            </span>
            <span className="text-muted-foreground ml-1">von {project.budgetPlanned}k €</span>
          </div>
        </div>
        
        {/* Team */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            Team
          </span>
          <span>{project.ownerName} +{project.teamMemberCount} Mitglieder</span>
        </div>
        
        {/* Deadline */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Deadline
          </span>
          <div>
            <span>{project.deadline}</span>
            {project.daysOverdue && project.daysOverdue > 0 && (
              <span className="text-red-600 ml-2">{project.daysOverdue} Tage überfällig</span>
            )}
          </div>
        </div>
        
        {/* Tasks */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <span className="flex items-center gap-1 text-muted-foreground">
            <CheckSquare className="h-3 w-3" />
            Aufgaben
          </span>
          <span>{project.tasksCompleted} / {project.tasksTotal} abgeschlossen</span>
        </div>
      </CardContent>
    </Card>
  );
};

const EnterpriseProjectGrid = () => {
  const { isEmployee } = useEnterprisePermissions();
  const { projects: rawProjects, isLoading } = useProjects();
  const { user } = useAuth();
  
  // Filtere Projekte basierend auf Rolle
  const filteredProjects = rawProjects.filter(project => {
    if (!isEmployee) {
      // Admin/HR sehen alle Projekte
      return true;
    }
    // Mitarbeiter sehen nur zugewiesene Projekte
    const isOwner = project.owner_id === user?.id;
    const isTeamMember = Array.isArray(project.team_members) && 
      project.team_members.includes(user?.id);
    return isOwner || isTeamMember;
  });
  
  // Mappe Projekte auf EnterpriseProject Format
  const projects: EnterpriseProject[] = filteredProjects.map(project => ({
    id: project.id,
    name: project.name || 'Unbenanntes Projekt',
    description: project.description || undefined,
    category: project.project_type || 'Standard',
    status: (project.status as EnterpriseProject['status']) || 'planning',
    priority: (project.priority as EnterpriseProject['priority']) || 'medium',
    progress: project.progress || 0,
    budgetSpent: project.budget ? Math.round((project.budget * (project.progress || 0)) / 100 / 1000) : 0,
    budgetPlanned: project.budget ? Math.round(project.budget / 1000) : 0,
    budgetDeviation: 0,
    ownerName: 'Projektleiter',
    teamMemberCount: Array.isArray(project.team_members) ? project.team_members.length : 0,
    deadline: project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '-',
    daysOverdue: undefined,
    tasksCompleted: 0,
    tasksTotal: 0,
  }));

  const emptyMessage = isEmployee 
    ? 'Sie sind noch keinem Projekt zugewiesen'
    : 'Keine Projekte vorhanden';
  
  const emptySubMessage = isEmployee
    ? 'Sobald Sie einem Projekt zugewiesen werden, erscheint es hier'
    : 'Erstellen Sie ein neues Projekt, um zu beginnen';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Projekte werden geladen...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>{emptyMessage}</p>
            <p className="text-sm">{emptySubMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <EnterpriseProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnterpriseProjectGrid;
