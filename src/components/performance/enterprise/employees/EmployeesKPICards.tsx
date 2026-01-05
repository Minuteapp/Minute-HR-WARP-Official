import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";

interface EmployeesKPICardsProps {
  total: number;
  excellent: number;
  normal: number;
  critical: number;
  avgGoalAchievement: number;
}

export const EmployeesKPICards = ({
  total,
  excellent,
  normal,
  critical,
  avgGoalAchievement
}: EmployeesKPICardsProps) => {
  const excellentPercent = total > 0 ? Math.round((excellent / total) * 100) : 0;
  const normalPercent = total > 0 ? Math.round((normal / total) * 100) : 0;
  const criticalPercent = total > 0 ? Math.round((critical / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{excellent}</p>
              <p className="text-sm text-muted-foreground">{excellentPercent}% Sehr gut</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{normal}</p>
              <p className="text-sm text-muted-foreground">{normalPercent}% Normal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{critical}</p>
              <p className="text-sm text-muted-foreground">{criticalPercent}% Kritisch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div>
            <p className="text-2xl font-bold text-primary">{avgGoalAchievement}%</p>
            <p className="text-sm text-muted-foreground mb-2">Ø Zielerreichung</p>
            <PerformanceProgressBar value={avgGoalAchievement} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
