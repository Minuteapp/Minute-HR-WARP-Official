import { Target } from 'lucide-react';
import { UserGoalStats } from '@/types/goals-statistics';
import { Badge } from '@/components/ui/badge';

interface UserStatsCardProps {
  stats: UserGoalStats;
}

export const UserStatsCard = ({ stats }: UserStatsCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-foreground">{stats.userName}</h3>
            {stats.isAdmin && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{stats.department}</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalGoals}</p>
              <p className="text-xs text-muted-foreground">Gesamt Ziele</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
              <p className="text-xs text-muted-foreground">On Track</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-100 rounded-full p-4">
          <Target className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
};
