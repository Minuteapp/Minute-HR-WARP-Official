import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SkillMemberRowProps {
  member: {
    id: string;
    initials: string;
    name: string;
    role: string;
    level: 'expert' | 'senior' | 'medior' | 'junior';
    years: number;
    utilizationPercent: number;
  };
}

const getLevelBadgeStyle = (level: string) => {
  switch (level) {
    case 'expert':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'senior':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'medior':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'junior':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getLevelLabel = (level: string) => {
  switch (level) {
    case 'expert': return 'Expert';
    case 'senior': return 'Senior';
    case 'medior': return 'Medior';
    case 'junior': return 'Junior';
    default: return level;
  }
};

const getUtilizationColor = (percent: number) => {
  if (percent >= 90) return 'bg-red-100 text-red-700 border-red-200';
  if (percent >= 71) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
};

const SkillMemberRow = ({ member }: SkillMemberRowProps) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {member.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm text-foreground">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`${getLevelBadgeStyle(member.level)} border text-xs`}>
          {getLevelLabel(member.level)}
        </Badge>
        <span className="text-sm text-muted-foreground">{member.years} Jahre</span>
        <Badge variant="outline" className={`${getUtilizationColor(member.utilizationPercent)} border text-xs`}>
          {member.utilizationPercent}%
        </Badge>
      </div>
    </div>
  );
};

export default SkillMemberRow;
