import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye } from "lucide-react";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { OverdueReviewWarning } from "./OverdueReviewWarning";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface EmployeePerformanceCardProps {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    position: string | null;
    department_name?: string;
    team_name?: string;
  };
  activeGoals: number;
  goalAchievement: number;
  lastReviewDate: string | null;
  overdueReviews: number;
  status: 'critical' | 'normal' | 'excellent';
  onViewDetails: () => void;
}

export const EmployeePerformanceCard = ({
  employee,
  activeGoals,
  goalAchievement,
  lastReviewDate,
  overdueReviews,
  status,
  onViewDetails
}: EmployeePerformanceCardProps) => {
  const isCritical = status === 'critical';

  return (
    <Card className={isCritical ? 'border-orange-200' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {isCritical && (
              <div className="p-2 bg-orange-100 rounded-full mt-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">
                  {employee.first_name} {employee.last_name}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{employee.position || 'Keine Position'}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {employee.department_name && (
                  <Badge variant="secondary">{employee.department_name}</Badge>
                )}
                {employee.team_name && (
                  <Badge variant="outline">{employee.team_name}</Badge>
                )}
                <EmployeeStatusBadge status={status} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Aktive Ziele</p>
                  <p className="font-medium">{activeGoals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zielerreichung</p>
                  <div className="flex items-center gap-2">
                    <PerformanceProgressBar value={goalAchievement} className="flex-1" />
                    <span className="text-sm font-medium">{goalAchievement}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Letztes Review</p>
                  <p className="font-medium">
                    {lastReviewDate 
                      ? format(new Date(lastReviewDate), 'dd.MM.yyyy', { locale: de })
                      : 'Keins'
                    }
                  </p>
                </div>
              </div>

              <OverdueReviewWarning count={overdueReviews} />
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onViewDetails} className="gap-2">
            <Eye className="h-4 w-4" />
            Ziele & Performance ansehen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
