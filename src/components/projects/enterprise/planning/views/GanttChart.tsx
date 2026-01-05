import { useMemo } from 'react';
import GanttProjectRow from './GanttProjectRow';

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

interface GanttChartProps {
  projects: GanttProject[];
  startMonth: Date;
  endMonth: Date;
}

const GanttChart = ({ projects, startMonth, endMonth }: GanttChartProps) => {
  const months = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(startMonth);
    while (current <= endMonth) {
      result.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }, [startMonth, endMonth]);

  const totalDays = useMemo(() => {
    return Math.ceil((endMonth.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24));
  }, [startMonth, endMonth]);

  const todayPosition = useMemo(() => {
    const today = new Date();
    const daysFromStart = Math.ceil((today.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24));
    return (daysFromStart / totalDays) * 100;
  }, [startMonth, totalDays]);

  if (projects.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
        <p>Keine Projekte für das Gantt-Diagramm vorhanden</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header with months */}
      <div className="flex border-b border-border bg-muted/50">
        <div className="w-48 flex-shrink-0 p-3 border-r border-border font-medium text-sm">
          Projekt
        </div>
        <div className="flex-1 flex relative">
          {months.map((month, index) => (
            <div
              key={index}
              className="flex-1 p-2 text-center text-xs text-muted-foreground border-r border-border last:border-r-0"
            >
              {month.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })}
            </div>
          ))}
        </div>
      </div>

      {/* Project rows with today line */}
      <div className="relative">
        {/* Today line */}
        {todayPosition > 0 && todayPosition < 100 && (
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{ left: `calc(192px + ${todayPosition}% * (100% - 192px) / 100)` }}
          >
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
              Heute
            </div>
            <div className="w-0.5 h-full bg-red-500" />
          </div>
        )}

        {projects.map((project) => (
          <GanttProjectRow
            key={project.id}
            project={project}
            startMonth={startMonth}
            totalDays={totalDays}
          />
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
