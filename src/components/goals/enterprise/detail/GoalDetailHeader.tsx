import { Target } from "lucide-react";
import { GoalLevelBadge } from "../common/GoalLevelBadge";
import { GoalTypeBadge } from "../common/GoalTypeBadge";
import { GoalStatusBadge } from "../common/GoalStatusBadge";

interface GoalDetailHeaderProps {
  title: string;
  description?: string;
  goalLevel: string;
  goalType: string;
  status: string;
}

export const GoalDetailHeader = ({
  title,
  description,
  goalLevel,
  goalType,
  status
}: GoalDetailHeaderProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Target className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <GoalLevelBadge level={goalLevel} />
          <GoalTypeBadge type={goalType} />
          <GoalStatusBadge status={status} />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
