import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Verfügbar' | 'Normal' | 'Überlastet';
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  workload: number;
  overdueTasks?: number;
  avatarColor: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: () => void;
}

export const TeamMemberCard = ({ member, onClick }: TeamMemberCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 100) return 'bg-red-500';
    if (workload >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusVariant = (status: string) => {
    if (status === 'Überlastet') return 'destructive';
    if (status === 'Verfügbar') return 'default';
    return 'secondary';
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12">
          <AvatarFallback className={cn('text-white', member.avatarColor)}>
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>

        {/* Name und Rolle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{member.name}</h3>
            <Badge variant={getStatusVariant(member.status)} className="text-xs">
              {member.status}
            </Badge>
            {member.overdueTasks && member.overdueTasks > 0 && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">{member.overdueTasks} überfällig</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.role}</p>
        </div>

        {/* Statistiken */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold">{member.totalTasks}</div>
            <div className="text-xs text-muted-foreground">Gesamt</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-500">{member.openTasks}</div>
            <div className="text-xs text-muted-foreground">Offen</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-500">{member.inProgressTasks}</div>
            <div className="text-xs text-muted-foreground">In Arbeit</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-500">{member.completedTasks}</div>
            <div className="text-xs text-muted-foreground">Erledigt</div>
          </div>
        </div>

        {/* Auslastung */}
        <div className="w-48">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Auslastung</span>
            <span className={cn(
              'font-semibold',
              member.workload > 100 ? 'text-red-500' :
              member.workload >= 80 ? 'text-orange-500' :
              'text-green-500'
            )}>
              {member.workload}%
            </span>
          </div>
          <Progress 
            value={Math.min(member.workload, 100)} 
            className="h-2"
            indicatorClassName={getWorkloadColor(member.workload)}
          />
        </div>

        {/* Pfeil */}
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
};
