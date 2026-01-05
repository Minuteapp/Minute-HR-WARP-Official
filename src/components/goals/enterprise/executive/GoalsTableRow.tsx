import { TableCell, TableRow } from "@/components/ui/table";
import { GoalLevelBadge } from "../common/GoalLevelBadge";
import { GoalStatusBadge } from "../common/GoalStatusBadge";
import { GoalRiskBadge } from "../common/GoalRiskBadge";
import { GoalTrendIcon } from "../common/GoalTrendIcon";
import { GoalProgressBar } from "../common/GoalProgressBar";

interface Goal {
  id: string;
  title: string;
  goal_level: string;
  owner_name?: string;
  status: string;
  progress: number;
  trend: string;
  risk_level: string;
}

interface GoalsTableRowProps {
  goal: Goal;
  onClick: (goal: Goal) => void;
}

export const GoalsTableRow = ({ goal, onClick }: GoalsTableRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(goal)}
    >
      <TableCell>
        <span className="font-medium text-purple-600 hover:underline">
          {goal.title}
        </span>
      </TableCell>
      <TableCell>
        <GoalLevelBadge level={goal.goal_level} />
      </TableCell>
      <TableCell>{goal.owner_name || '-'}</TableCell>
      <TableCell>
        <GoalStatusBadge status={goal.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 min-w-[120px]">
          <GoalProgressBar progress={goal.progress} className="flex-1" />
          <span className="text-sm text-muted-foreground w-10">
            {goal.progress}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <GoalTrendIcon trend={goal.trend} />
      </TableCell>
      <TableCell>
        <GoalRiskBadge risk={goal.risk_level} />
      </TableCell>
    </TableRow>
  );
};
