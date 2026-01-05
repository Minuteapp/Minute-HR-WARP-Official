import { useMemo } from 'react';

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

interface GanttProjectRowProps {
  project: GanttProject;
  startMonth: Date;
  totalDays: number;
}

const GanttProjectRow = ({ project, startMonth, totalDays }: GanttProjectRowProps) => {
  const statusColors = {
    'active': 'bg-blue-500',
    'at-risk': 'bg-orange-400',
    'delayed': 'bg-red-400',
    'planning': 'bg-gray-400'
  };

  const barPosition = useMemo(() => {
    const projectStart = Math.max(project.startDate.getTime(), startMonth.getTime());
    const projectEnd = project.endDate.getTime();
    
    const startDays = Math.ceil((projectStart - startMonth.getTime()) / (1000 * 60 * 60 * 24));
    const durationDays = Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24));
    
    return {
      left: (startDays / totalDays) * 100,
      width: (durationDays / totalDays) * 100
    };
  }, [project, startMonth, totalDays]);

  const milestonePositions = useMemo(() => {
    return project.milestones.map(milestone => {
      const days = Math.ceil((milestone.date.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24));
      return (days / totalDays) * 100;
    });
  }, [project.milestones, startMonth, totalDays]);

  return (
    <div className="flex border-b border-border last:border-b-0 hover:bg-muted/30">
      <div className="w-48 flex-shrink-0 p-3 border-r border-border">
        <p className="font-medium text-sm truncate">{project.name}</p>
        <p className="text-xs text-muted-foreground truncate">{project.owner}</p>
      </div>
      <div className="flex-1 p-3 relative">
        {/* Project bar */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${statusColors[project.status]} flex items-center`}
          style={{
            left: `${barPosition.left}%`,
            width: `${Math.max(barPosition.width, 2)}%`
          }}
        >
          <span className="text-xs text-white font-medium ml-2">
            {project.progress}%
          </span>
        </div>

        {/* Milestone points */}
        {milestonePositions.map((position, index) => (
          <div
            key={index}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full shadow-sm z-10"
            style={{ left: `${position}%`, marginLeft: '-8px' }}
          />
        ))}
      </div>
    </div>
  );
};

export default GanttProjectRow;
