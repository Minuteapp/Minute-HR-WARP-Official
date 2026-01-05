import { useMemo } from 'react';
import { TimeEntry } from '@/types/time-tracking.types';
import { groupByWeek, groupByWeekday } from '@/utils/timeReportCalculations';
import WorkHoursAreaChart from './charts/WorkHoursAreaChart';
import WeekdayAverageChart from './charts/WeekdayAverageChart';
import WeeklyOverviewBars from './charts/WeeklyOverviewBars';

interface OverviewTabProps {
  data: TimeEntry[];
  period: string;
}

const OverviewTab = ({ data }: OverviewTabProps) => {
  const weeklyData = useMemo(() => groupByWeek(data), [data]);
  const weekdayData = useMemo(() => groupByWeekday(data), [data]);

  return (
    <div className="space-y-6">
      {/* Charts nebeneinander */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkHoursAreaChart data={weeklyData} />
        <WeekdayAverageChart data={weekdayData} />
      </div>
      
      {/* Wochenübersicht darunter */}
      <WeeklyOverviewBars data={weeklyData} />
    </div>
  );
};

export default OverviewTab;
