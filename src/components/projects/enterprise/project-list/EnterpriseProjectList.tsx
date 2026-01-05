import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, Users, Loader2 } from 'lucide-react';
import ProjectStatusBadge from './ProjectStatusBadge';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { useProjects } from '@/hooks/projects/useProjects';
import { useAuth } from '@/contexts/AuthContext';

interface EnterpriseProject {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'at-risk' | 'delayed' | 'on-hold' | 'completed' | 'planning' | 'pending';
  ownerName: string;
  teamMemberCount: number;
  progress: number;
  budgetSpent: number;
  budgetPlanned: number;
  budgetDeviation: number;
  startDate: string;
  endDate: string;
  tasksOpen: number;
  tasksTotal: number;
}

const EnterpriseProjectRow = ({ project }: { project: EnterpriseProject }) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50">
      {/* Name & Badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
            {project.category}
          </Badge>
          <ProjectStatusBadge status={project.status} />
          <span className="font-medium truncate">{project.name}</span>
        </div>
      </div>
      
      {/* Owner */}
      <div className="w-32 flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{project.ownerName}</span>
        <span className="text-xs">+{project.teamMemberCount}</span>
      </div>
      
      {/* Progress */}
      <div className="w-32">
        <div className="flex items-center gap-2">
          <Progress value={project.progress} className="h-2 flex-1" />
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
      </div>
      
      {/* Budget */}
      <div className="w-36 text-sm">
        <span>{project.budgetSpent}k / {project.budgetPlanned}k €</span>
        <span className={`ml-2 ${project.budgetDeviation < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {project.budgetDeviation > 0 ? '+' : ''}{project.budgetDeviation}%
        </span>
      </div>
      
      {/* Dates & Tasks */}
      <div className="w-48 text-sm text-muted-foreground">
        <div>{project.startDate} - {project.endDate}</div>
        <div className="text-xs">{project.tasksOpen} / {project.tasksTotal} Aufgaben offen</div>
      </div>
      
      {/* Actions */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
};

const EnterpriseProjectList = () => {
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
    category: project.project_type || 'Standard',
    status: (project.status as EnterpriseProject['status']) || 'planning',
    ownerName: 'Projektleiter',
    teamMemberCount: Array.isArray(project.team_members) ? project.team_members.length : 0,
    progress: project.progress || 0,
    budgetSpent: project.budget ? Math.round((project.budget * (project.progress || 0)) / 100 / 1000) : 0,
    budgetPlanned: project.budget ? Math.round(project.budget / 1000) : 0,
    budgetDeviation: 0,
    startDate: project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '-',
    endDate: project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '-',
    tasksOpen: 0,
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
    <Card>
      <CardContent className="p-0">
        {projects.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>{emptyMessage}</p>
            <p className="text-sm">{emptySubMessage}</p>
          </div>
        ) : (
          projects.map((project) => (
            <EnterpriseProjectRow key={project.id} project={project} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseProjectList;
