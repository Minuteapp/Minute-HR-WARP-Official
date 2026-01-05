import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Edit } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DevelopmentPlanCardProps {
  plans: any[];
}

export const DevelopmentPlanCard = ({ plans }: DevelopmentPlanCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-500";
      case "planned":
        return "bg-blue-500";
      case "completed":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "planned":
        return "Geplant";
      case "completed":
        return "Abgeschlossen";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Individueller Entwicklungsplan (IDP) 2025
          </CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Plan bearbeiten
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {plans.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Keine Entwicklungsziele definiert
          </p>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="bg-muted/30">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{plan.goal_title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(plan.priority)}>
                        Priorität: {plan.priority === "high" ? "Hoch" : plan.priority === "medium" ? "Mittel" : "Niedrig"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Zieltermin: {plan.target_date ? format(new Date(plan.target_date), "MMM yyyy", { locale: de }) : "TBD"}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>
                    {getStatusLabel(plan.status)}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Fortschritt</span>
                    <span className="font-bold">{parseFloat(plan.progress_percentage).toFixed(0)}%</span>
                  </div>
                  <Progress value={parseFloat(plan.progress_percentage)} className="h-2" />
                </div>

                {plan.progress_notes && (
                  <p className="text-sm text-muted-foreground">
                    {plan.measures_completed} von {plan.measures_total} Maßnahmen abgeschlossen: {plan.progress_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
