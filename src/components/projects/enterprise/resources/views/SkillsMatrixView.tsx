import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SkillGroupCard from './SkillGroupCard';

interface SkillMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  level: 'expert' | 'senior' | 'medior' | 'junior';
  years: number;
  utilizationPercent: number;
}

interface SkillGroup {
  id: string;
  name: string;
  memberCount: number;
  availableCount: number;
  avgExperience: number;
  members: SkillMember[];
}

interface SkillsMatrixViewProps {
  skillGroups: SkillGroup[];
}

const SkillsMatrixView = ({ skillGroups }: SkillsMatrixViewProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Skills-Matrix & Expertise</h3>
        <p className="text-sm text-muted-foreground">Übersicht aller Skills und deren Verfügbarkeit im Team</p>
      </div>
      
      {skillGroups.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Keine Skills gefunden</p>
            <p className="text-sm">Fügen Sie Skills zu Ihren Teammitgliedern hinzu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {skillGroups.map((skillGroup) => (
            <SkillGroupCard key={skillGroup.id} skillGroup={skillGroup} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsMatrixView;
