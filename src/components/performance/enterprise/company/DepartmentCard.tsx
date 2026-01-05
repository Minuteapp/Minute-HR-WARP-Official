import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { TrendBadge } from "../common/TrendBadge";
import { OverdueReviewsBadge } from "../common/OverdueReviewsBadge";
import { DimensionScoreCard } from "../common/DimensionScoreCard";

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    teamCount: number;
    employeeCount: number;
    overdueReviews: number;
    trend: "rising" | "falling" | "stable";
    goalsScore: number;
    tasksScore: number;
    feedbackScore: number;
    developmentScore: number;
    overallScore: number;
  };
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">{department.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <TrendBadge trend={department.trend} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(department.overallScore)}</div>
            <p className="text-xs text-muted-foreground">Performance</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{department.teamCount} Teams</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{department.employeeCount} Mitarbeiter</span>
          </div>
          {department.overdueReviews > 0 && (
            <OverdueReviewsBadge count={department.overdueReviews} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DimensionScoreCard
            dimension="goals"
            score={department.goalsScore}
            className="p-2"
          />
          <DimensionScoreCard
            dimension="tasks"
            score={department.tasksScore}
            className="p-2"
          />
          <DimensionScoreCard
            dimension="feedback"
            score={department.feedbackScore}
            className="p-2"
          />
          <DimensionScoreCard
            dimension="development"
            score={department.developmentScore}
            className="p-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
