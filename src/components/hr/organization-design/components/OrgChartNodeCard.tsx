import { cn } from "@/lib/utils";
import { MapPin, Users, Building2, Clock, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OrgChartNode {
  id: string;
  name: string;
  position: string;
  department: string;
  location?: string;
  metrics: {
    employees: number;
    teams: number;
    vacancies: number;
    performance: number;
  };
  isVacant?: boolean;
  teamsCount?: number;
}

interface OrgChartNodeCardProps {
  node: OrgChartNode;
  isSelected?: boolean;
  onSelect?: () => void;
  onExpandTeams?: () => void;
  teamsExpanded?: boolean;
}

export const OrgChartNodeCard = ({
  node,
  isSelected = false,
  onSelect,
  onExpandTeams,
  teamsExpanded = false,
}: OrgChartNodeCardProps) => {
  const getBorderColor = () => {
    if (isSelected) return "border-blue-500";
    if (node.isVacant) return "border-red-500";
    return "border-green-500";
  };

  const getPositionColor = () => {
    if (node.isVacant) return "text-red-600";
    return "text-blue-600";
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[280px] max-w-[320px]",
        getBorderColor()
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-base">
              {node.isVacant ? (
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">Vakant</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    Offen
                  </span>
                </span>
              ) : (
                node.name
              )}
            </h3>
            <p className={cn("text-sm font-medium mt-0.5", getPositionColor())}>
              {node.position}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{node.department}</p>
            {node.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{node.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{node.metrics.employees}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium text-green-600">{node.metrics.teams}</span>
          </div>
          {node.metrics.vacancies > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-red-600" />
              <span className="font-medium text-red-600">{node.metrics.vacancies}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium text-green-600">{node.metrics.performance}%</span>
          </div>
        </div>
      </div>

      {/* Teams Expand Button */}
      {(node.teamsCount ?? node.metrics.teams) > 0 && onExpandTeams && (
        <div className="border-t border-border">
          <Button
            variant="ghost"
            className="w-full h-9 rounded-none rounded-b-xl text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onExpandTeams();
            }}
          >
            {teamsExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                Teams ausblenden
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                {node.teamsCount ?? node.metrics.teams} Teams anzeigen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
