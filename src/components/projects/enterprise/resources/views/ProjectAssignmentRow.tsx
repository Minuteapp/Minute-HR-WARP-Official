import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectAssignmentRowProps {
  assignment: {
    id: string;
    projectName: string;
    startDate: string;
    endDate: string;
    hoursPerWeek: number;
    role: string;
  };
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const calculateWeeks = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
};

const ProjectAssignmentRow = ({ assignment }: ProjectAssignmentRowProps) => {
  const weeks = calculateWeeks(assignment.startDate, assignment.endDate);

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm text-foreground">{assignment.projectName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)} ({weeks} Wochen)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">{assignment.hoursPerWeek}h/Woche</span>
        <Badge variant="outline" className="text-xs">{assignment.role}</Badge>
      </div>
    </div>
  );
};

export default ProjectAssignmentRow;
