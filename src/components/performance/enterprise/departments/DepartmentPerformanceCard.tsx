import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Building2, Users } from "lucide-react";
import { TrendBadge } from "../common/TrendBadge";
import { OverdueReviewsBadge } from "../common/OverdueReviewsBadge";
import { DimensionScoreCard } from "../common/DimensionScoreCard";
import { DepartmentTeamsList } from "./DepartmentTeamsList";

interface DepartmentPerformanceCardProps {
  department: { id: string; name: string; teamCount: number; employeeCount: number; overdueReviews: number; trend: "rising" | "falling" | "stable"; goalsScore: number; tasksScore: number; feedbackScore: number; developmentScore: number; overallScore: number; };
}

export function DepartmentPerformanceCard({ department }: DepartmentPerformanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Building2 className="h-5 w-5 text-purple-600" /></div>
            <div>
              <h3 className="font-semibold">{department.name}</h3>
              <div className="flex items-center gap-2 mt-1"><TrendBadge trend={department.trend} /></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right"><div className="text-3xl font-bold">{Math.round(department.overallScore)}</div><p className="text-xs text-muted-foreground">Performance</p></div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{department.teamCount} Teams</span></div>
          <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{department.employeeCount} Mitarbeiter</span></div>
          {department.overdueReviews > 0 && <OverdueReviewsBadge count={department.overdueReviews} />}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          <DimensionScoreCard dimension="goals" score={department.goalsScore} className="p-2" />
          <DimensionScoreCard dimension="tasks" score={department.tasksScore} className="p-2" />
          <DimensionScoreCard dimension="feedback" score={department.feedbackScore} className="p-2" />
          <DimensionScoreCard dimension="development" score={department.developmentScore} className="p-2" />
        </div>
        {isExpanded && <DepartmentTeamsList departmentId={department.id} departmentName={department.name} />}
      </CardContent>
    </Card>
  );
}
