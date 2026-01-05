import { Card, CardContent } from "@/components/ui/card";
import { GoalLevelBadge } from "../common/GoalLevelBadge";
import { DeviationProgressBar } from "./DeviationProgressBar";

interface CriticalGoalCardProps {
  title: string;
  ownerName: string;
  level: string;
  currentProgress: number;
  targetProgress: number;
}

export const CriticalGoalCard = ({ 
  title, 
  ownerName, 
  level, 
  currentProgress, 
  targetProgress 
}: CriticalGoalCardProps) => {
  const deviation = currentProgress - targetProgress;

  return (
    <Card className="border-red-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{ownerName}</p>
          </div>
          <div className="flex items-center gap-2">
            <GoalLevelBadge level={level} />
            <span className="text-sm font-medium text-red-600">
              {deviation}%
            </span>
          </div>
        </div>
        <DeviationProgressBar 
          currentProgress={currentProgress} 
          targetProgress={targetProgress} 
        />
      </CardContent>
    </Card>
  );
};
