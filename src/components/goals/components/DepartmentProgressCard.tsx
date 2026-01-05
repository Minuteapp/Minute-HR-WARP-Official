import { DepartmentStats } from '@/types/goals-statistics';
import { Progress } from '@/components/ui/progress';

interface DepartmentProgressCardProps {
  stats: DepartmentStats;
}

export const DepartmentProgressCard = ({ stats }: DepartmentProgressCardProps) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-foreground">{stats.department}</h4>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
          <p className="text-xs text-muted-foreground">{stats.totalGoals} Ziele</p>
        </div>
      </div>
      
      <Progress value={stats.completionRate} className="h-2 mb-2" />
      
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{stats.onTrack} On Track</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">{stats.atRisk} At Risk</span>
        </div>
      </div>
    </div>
  );
};
