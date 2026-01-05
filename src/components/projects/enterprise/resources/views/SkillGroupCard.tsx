import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import SkillMemberRow from './SkillMemberRow';

interface SkillMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  level: 'expert' | 'senior' | 'medior' | 'junior';
  years: number;
  utilizationPercent: number;
}

interface SkillGroupCardProps {
  skillGroup: {
    id: string;
    name: string;
    memberCount: number;
    availableCount: number;
    avgExperience: number;
    members: SkillMember[];
  };
}

const SkillGroupCard = ({ skillGroup }: SkillGroupCardProps) => {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">{skillGroup.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {skillGroup.memberCount} Mitarbeiter • {skillGroup.availableCount} verfügbar • Ø {skillGroup.avgExperience.toFixed(1)} Jahre Erfahrung
        </p>
        <div className="space-y-2">
          {skillGroup.members.map((member) => (
            <SkillMemberRow key={member.id} member={member} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillGroupCard;
