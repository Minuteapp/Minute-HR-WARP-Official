import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { GoalStatusIcon } from "./GoalStatusIcon";
import { GoalProgressBar } from "./GoalProgressBar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    progress: number;
    status: string;
    due_date?: string;
  };
  onView: () => void;
}

export const GoalCard = ({ goal, onView }: GoalCardProps) => {
  const getStatusBadge = () => {
    switch (goal.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Abgeschlossen</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">Im Plan</Badge>;
      case 'at_risk':
        return <Badge className="bg-orange-100 text-orange-700">Gefährdet</Badge>;
      default:
        return <Badge variant="secondary">{goal.status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <GoalStatusIcon status={goal.status} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge()}
              </div>
              <h4 className="font-semibold mb-1">{goal.title}</h4>
              {goal.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {goal.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="outline">Ziel</Badge>
                {goal.due_date && (
                  <span>Fällig: {format(new Date(goal.due_date), 'dd.MM.yyyy', { locale: de })}</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Fortschritt</span>
                <GoalProgressBar progress={goal.progress} className="flex-1 max-w-xs" />
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onView}>
            Ansehen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
