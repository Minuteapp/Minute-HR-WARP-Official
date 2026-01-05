import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ResourceDetailsRowProps {
  member: {
    id: string;
    initials: string;
    name: string;
    location: string;
    role: string;
    department: string;
    utilizationPercent: number;
    projects: { projectId: string }[];
    availableThisWeek: number;
    availableThisMonth: number;
    weeklyCost: number;
    hourlyRate: number;
    performanceScore: number;
    onTimePercent: number;
  };
}

const getUtilizationColor = (percent: number) => {
  if (percent >= 90) return 'bg-red-100 text-red-700 border-red-200';
  if (percent >= 71) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
};

const getProgressColor = (percent: number) => {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 71) return 'bg-yellow-500';
  return 'bg-green-500';
};

const ResourceDetailsRow = ({ member }: ResourceDetailsRowProps) => {
  return (
    <tr className="border-b border-border hover:bg-muted/50">
      {/* Mitarbeiter */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.location}</p>
          </div>
        </div>
      </td>

      {/* Rolle */}
      <td className="py-3 px-4">
        <p className="text-sm text-foreground">{member.role}</p>
        <p className="text-xs text-muted-foreground">{member.department}</p>
      </td>

      {/* Auslastung */}
      <td className="py-3 px-4">
        <div className="space-y-1">
          <Badge variant="outline" className={`${getUtilizationColor(member.utilizationPercent)} border text-xs`}>
            {member.utilizationPercent}%
          </Badge>
          <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(member.utilizationPercent)}`}
              style={{ width: `${Math.min(member.utilizationPercent, 100)}%` }}
            />
          </div>
        </div>
      </td>

      {/* Projekte */}
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {member.projects.slice(0, 3).map((project, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {project.projectId}
            </Badge>
          ))}
          {member.projects.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{member.projects.length - 3}
            </Badge>
          )}
        </div>
      </td>

      {/* Verfügbar */}
      <td className="py-3 px-4">
        <p className="text-sm text-foreground">{member.availableThisWeek}h diese Woche</p>
        <p className="text-xs text-muted-foreground">{member.availableThisMonth}h/Monat</p>
      </td>

      {/* Kosten/Woche */}
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-foreground">€{member.weeklyCost.toLocaleString('de-DE')}</p>
        <p className="text-xs text-muted-foreground">€{member.hourlyRate}/h</p>
      </td>

      {/* Performance */}
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-foreground">{member.performanceScore.toFixed(1)}/10</p>
        <p className="text-xs text-muted-foreground">{member.onTimePercent}% on-time</p>
      </td>
    </tr>
  );
};

export default ResourceDetailsRow;
