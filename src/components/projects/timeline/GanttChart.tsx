import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TimelineProject, TimelineTask } from '@/types/timeline';
import { getStatusColor, getStatusText } from '@/utils/statusUtils';

interface GanttChartProps {
  projects: TimelineProject[];
}

const months = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
];

export const GanttChart = ({ projects: initialProjects }: GanttChartProps) => {
  const [projects, setProjects] = useState(initialProjects);

  const toggleProject = (projectId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId ? { ...p, isExpanded: !p.isExpanded } : p
      )
    );
  };

  const getTaskPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const yearStart = new Date('2025-01-01');
    const yearEnd = new Date('2025-12-31');

    const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const left = Math.max(0, (startOffset / totalDays) * 100);
    const width = Math.min(100 - left, (duration / totalDays) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white text-xs">Fertig</Badge>;
      case 'on-track':
        return <Badge className="bg-green-100 text-green-700 text-xs">On Track</Badge>;
      case 'at-risk':
        return <Badge className="bg-orange-100 text-orange-700 text-xs">Gefährdet</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-700 text-xs">Verzögert</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Geplant</Badge>;
    }
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'on-track':
        return 'bg-blue-500';
      case 'at-risk':
        return 'bg-orange-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const renderTask = (task: TimelineTask) => {
    const position = getTaskPosition(task.startDate, task.endDate);
    
    return (
      <div key={task.id} className="flex items-center border-b hover:bg-muted/30">
        {/* Left Column - Task Info */}
        <div className="w-72 p-3 border-r flex-shrink-0 bg-card">
          <div className="flex items-center gap-2 pl-6">
            <div className="flex-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(task.startDate).toLocaleDateString('de-DE')} → {new Date(task.endDate).toLocaleDateString('de-DE')}
              </p>
            </div>
            {getStatusBadge(task.status)}
          </div>
        </div>

        {/* Right Column - Timeline Bar */}
        <div className="flex-1 p-3 relative h-16">
          <div className="absolute inset-y-3 left-0 right-0">
            <div
              className={`absolute h-6 rounded ${getBarColor(task.status)} flex items-center overflow-hidden`}
              style={position}
            >
              <div className="w-full h-full relative">
                <div 
                  className="absolute inset-y-0 left-0 bg-white/30"
                  style={{ width: `${task.progress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {task.progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center border-b bg-muted/50">
        <div className="w-72 p-3 border-r flex-shrink-0 font-medium text-sm">
          Projekt / Phase
        </div>
        <div className="flex-1 p-3">
          <div className="grid grid-cols-12 gap-0">
            {months.map((month, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects and Tasks */}
      <div className="max-h-[500px] overflow-y-auto">
        {projects.map((project) => (
          <div key={project.id}>
            {/* Project Row */}
            <div className="flex items-center border-b bg-primary/5 hover:bg-primary/10">
              <div className="w-72 p-3 border-r flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="hover:bg-muted rounded p-1 transition-colors"
                  >
                    {project.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="flex-1">
                    <span className="font-semibold text-sm">{project.title}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-center gap-3">
                  <Progress value={project.progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium w-12 text-right">{project.progress}%</span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            {project.isExpanded && project.tasks.map((task) => renderTask(task))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Fertig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Im Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>Gefährdet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>Verzögert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>Geplant</span>
          </div>
        </div>
      </div>
    </div>
  );
};