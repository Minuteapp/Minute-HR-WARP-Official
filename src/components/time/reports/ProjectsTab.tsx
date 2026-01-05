import { useMemo } from 'react';
import { TimeEntry } from '@/types/time-tracking.types';
import { groupByProject } from '@/utils/timeReportCalculations';
import ProjectPieChart from './charts/ProjectPieChart';
import ProjectDetailsList from './components/ProjectDetailsList';

interface ProjectsTabProps {
  data: TimeEntry[];
  period: string;
}

const ProjectsTab = ({ data }: ProjectsTabProps) => {
  const projectData = useMemo(() => groupByProject(data), [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProjectPieChart data={projectData} />
      <ProjectDetailsList data={projectData} />
    </div>
  );
};

export default ProjectsTab;
