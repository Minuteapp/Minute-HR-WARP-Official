import ResourceMemberCard from './ResourceMemberCard';

interface ProjectAssignment {
  id: string;
  projectId: string;
  name: string;
  role: string;
  hoursPerWeek: number;
  percentage: number;
  startDate: string;
  endDate: string;
}

interface Skill {
  name: string;
  level: 'expert' | 'senior' | 'medior' | 'junior';
  years: number;
}

interface ResourceMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  utilizationPercent: number;
  bookedHours: number;
  maxHours: number;
  hourlyRate: number;
  skills: Skill[];
  projects: ProjectAssignment[];
  availability: {
    thisWeek: number;
    nextWeek: number;
    nextMonth: number;
  };
  performance: {
    tasks: number;
    punctuality: number;
    quality: number;
  };
}

interface ResourcesOverviewProps {
  members: ResourceMember[];
}

const ResourcesOverview = ({ members }: ResourcesOverviewProps) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Keine Ressourcen gefunden</p>
        <p className="text-sm">Passen Sie die Filter an oder fügen Sie neue Ressourcen hinzu</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {members.map((member) => (
        <ResourceMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
};

export default ResourcesOverview;
