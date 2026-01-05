import { useMemo } from 'react';
import { TimeEntry } from '@/types/time-tracking.types';
import { analyzeMostProductiveDay, analyzeMostCommonStartTime, groupByProject } from '@/utils/timeReportCalculations';
import { generateRecommendations } from '@/utils/workPatternRecommendations';
import PatternAnalysisCard from './components/PatternAnalysisCard';
import RecommendationsCard from './components/RecommendationsCard';

interface PatternsTabProps {
  data: TimeEntry[];
  period: string;
}

const PatternsTab = ({ data }: PatternsTabProps) => {
  const mostProductiveDay = useMemo(() => analyzeMostProductiveDay(data), [data]);
  const mostCommonStartTime = useMemo(() => analyzeMostCommonStartTime(data), [data]);
  const mainProject = useMemo(() => {
    const projects = groupByProject(data);
    return projects.length > 0 
      ? { name: projects[0].name, hours: projects[0].hours }
      : { name: 'Kein Projekt', hours: 0 };
  }, [data]);
  
  const recommendations = useMemo(() => generateRecommendations(data), [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PatternAnalysisCard 
        mostProductiveDay={mostProductiveDay}
        mostCommonStartTime={mostCommonStartTime}
        mainProject={mainProject}
      />
      <RecommendationsCard recommendations={recommendations} />
    </div>
  );
};

export default PatternsTab;
