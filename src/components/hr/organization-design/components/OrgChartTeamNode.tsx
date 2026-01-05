import { cn } from "@/lib/utils";
import { Building2, Users, Target } from "lucide-react";

export interface OrgChartTeam {
  id: string;
  name: string;
  lead?: string;
  employeeCount: number;
  performance: number;
}

interface OrgChartTeamNodeProps {
  team: OrgChartTeam;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const OrgChartTeamNode = ({
  team,
  isSelected = false,
  onSelect,
}: OrgChartTeamNodeProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[200px] max-w-[240px]",
        isSelected ? "border-blue-500" : "border-purple-500"
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <Building2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-purple-700 text-sm truncate">{team.name}</h4>
            {team.lead && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{team.lead}</p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{team.employeeCount} MA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium text-green-600">{team.performance}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
