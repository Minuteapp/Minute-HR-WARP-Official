import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriticalProject {
  id: string;
  name: string;
  status: 'at-risk' | 'delayed';
  priority: string;
  ownerName: string;
  progress: number;
  blockedTasks: number;
}

const statusBadgeClasses: Record<string, string> = {
  'at-risk': 'bg-red-100 text-red-600 border border-red-200',
  delayed: 'bg-red-100 text-red-600 border border-red-200',
};

const EnterpriseCriticalCard = ({ project }: { project: CriticalProject }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{project.name}</span>
            <Badge className={`text-xs ${statusBadgeClasses[project.status]}`}>
              {project.status === 'at-risk' ? 'At Risk' : 'Verspätet'}
            </Badge>
            <Badge className="text-xs bg-orange-100 text-orange-600 border border-orange-200">
              {project.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{project.ownerName}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fortschritt: {project.progress}%</span>
          <span className="text-red-600">Blockiert: {project.blockedTasks}</span>
        </div>
        <Progress value={project.progress} className="h-2" />
      </div>
    </div>
  );
};

const EnterpriseTopCritical = () => {
  // Empty state - no mock data
  const criticalProjects: CriticalProject[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top-5 kritische Projekte</CardTitle>
        <p className="text-sm text-muted-foreground">
          Projekte mit höchstem Risiko oder Verzögerungen
        </p>
      </CardHeader>
      <CardContent>
        {criticalProjects.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Keine kritischen Projekte vorhanden</p>
          </div>
        ) : (
          <div className="space-y-4">
            {criticalProjects.map((project) => (
              <EnterpriseCriticalCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseTopCritical;
