import { Badge } from '@/components/ui/badge';
import GanttChart from './GanttChart';
import GanttLegend from './GanttLegend';

interface GanttProject {
  id: string;
  name: string;
  owner: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'active' | 'at-risk' | 'delayed' | 'planning';
  milestones: { date: Date }[];
}

interface GanttViewProps {
  projects: GanttProject[];
}

const GanttView = ({ projects }: GanttViewProps) => {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const endMonth = new Date(now.getFullYear() + 1, now.getMonth(), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Portfolio Gantt-Ansicht</h3>
          <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
            Vorschau
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {startMonth.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })} - {endMonth.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })}
        </span>
      </div>

      <GanttChart projects={projects} startMonth={startMonth} endMonth={endMonth} />
      <GanttLegend />
    </div>
  );
};

export default GanttView;
