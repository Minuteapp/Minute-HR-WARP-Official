import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { TrendBadge } from "../common/TrendBadge";
import { OverdueReviewsBadge } from "../common/OverdueReviewsBadge";
import { DimensionScoreCard } from "../common/DimensionScoreCard";
import { TeamGoalsDetail } from "./TeamGoalsDetail";

interface TeamPerformanceCardProps {
  team: { id: string; name: string; departmentName: string; employeeCount: number; overdueReviews: number; trend: "rising" | "falling" | "stable"; goalsScore: number; tasksScore: number; feedbackScore: number; developmentScore: number; overallScore: number; totalGoals: number; totalTasks: number; totalFeedback: number; totalDevelopment: number; };
}

export function TeamPerformanceCard({ team }: TeamPerformanceCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h3 className="font-semibold">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1"><TrendBadge trend={team.trend} /></div>
            </div>
          </div>
          <div className="text-right"><div className="text-3xl font-bold">{Math.round(team.overallScore)}</div><p className="text-xs text-muted-foreground">Performance</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
          <span>{team.departmentName}</span>
          <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{team.employeeCount} Mitarbeiter</span></div>
          {team.overdueReviews > 0 && <OverdueReviewsBadge count={team.overdueReviews} />}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          <DimensionScoreCard dimension="goals" score={team.goalsScore} count={team.totalGoals} className="p-2" />
          <DimensionScoreCard dimension="tasks" score={team.tasksScore} count={team.totalTasks} className="p-2" />
          <DimensionScoreCard dimension="feedback" score={team.feedbackScore} count={team.totalFeedback} className="p-2" />
          <DimensionScoreCard dimension="development" score={team.developmentScore} count={team.totalDevelopment} className="p-2" />
        </div>
        <TeamGoalsDetail teamId={team.id} />
      </CardContent>
    </Card>
  );
}
