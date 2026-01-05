import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ProjectAssignmentRow from './ProjectAssignmentRow';

interface ProjectAssignment {
  id: string;
  projectName: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  role: string;
}

interface MemberScheduleGroupProps {
  member: {
    id: string;
    initials: string;
    name: string;
    role: string;
    utilizationPercent: number;
    projects: ProjectAssignment[];
  };
}

const getUtilizationColor = (percent: number) => {
  if (percent >= 90) return 'bg-red-100 text-red-700 border-red-200';
  if (percent >= 71) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
};

const MemberScheduleGroup = ({ member }: MemberScheduleGroupProps) => {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${getUtilizationColor(member.utilizationPercent)} border`}>
            {member.utilizationPercent}%
          </Badge>
        </div>
        
        {member.projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Keine Projekte zugewiesen</p>
        ) : (
          <div className="space-y-2">
            {member.projects.map((project) => (
              <ProjectAssignmentRow key={project.id} assignment={project} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberScheduleGroup;
