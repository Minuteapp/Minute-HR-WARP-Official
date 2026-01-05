import MemberScheduleGroup from './MemberScheduleGroup';

interface ProjectAssignment {
  id: string;
  projectName: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  role: string;
}

interface MemberSchedule {
  id: string;
  initials: string;
  name: string;
  role: string;
  utilizationPercent: number;
  projects: ProjectAssignment[];
}

interface TimeSchedulingViewProps {
  memberSchedules: MemberSchedule[];
}

const TimeSchedulingView = ({ memberSchedules }: TimeSchedulingViewProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Ressourcen-Zeitplanung</h3>
        <p className="text-sm text-muted-foreground">Projekt-Zuweisungen über die Zeit</p>
      </div>
      
      {memberSchedules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Keine Zeitplanungen gefunden</p>
          <p className="text-sm">Weisen Sie Mitarbeiter zu Projekten zu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {memberSchedules.map((member) => (
            <MemberScheduleGroup key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSchedulingView;
